import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { T } from '../../libs/types/common';
import { Member } from '../../libs/dto/member/member';
import { JwtService } from '@nestjs/jwt';
import { shapeIntoMongoObjectId } from '../../libs/config';
import axios from 'axios';
import * as crypto from 'crypto';

import { OAuth2Client } from 'google-auth-library';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
	private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
	@InjectModel('Member') private readonly memberModel: Model<Member>;

	constructor(private jwtService: JwtService) {
		this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
	}

	public async hashPassword(memberPassword: string): Promise<string> {
		const salt = await bcrypt.genSalt();
		return await bcrypt.hash(memberPassword, salt);
	}

	public async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
		return await bcrypt.compare(password, hashedPassword);
	}

	public async createToken(member: Member): Promise<string> {
		console.log('member:', member);
		const payload: T = {};

		Object.keys(member['_doc'] ? member['_doc'] : member).map((ele) => {
			payload[`${ele}`] = member[`${ele}`];
		});
		delete payload.memberPassword;
		console.log('payload:', payload);
		return await this.jwtService.signAsync(payload);
	}

	public async verifyToken(token: string): Promise<Member> {
		const member = await this.jwtService.verifyAsync(token);
		member._id = shapeIntoMongoObjectId(member._id);
		return member;
	}

	// public async googleLogin(authCode: string): Promise<{ accessToken: string }> {
	// 	const params = new URLSearchParams();
	// 	params.append('code', authCode);
	// 	params.append('client_id', process.env.GOOGLE_CLIENT_ID!);
	// 	params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET!);
	// 	params.append('redirect_uri', process.env.GOOGLE_REDIRECT_URI!); // postmessage
	// 	params.append('grant_type', 'authorization_code');

	// 	let tokenResponse;
	// 	try {
	// 		tokenResponse = await axios.post('https://oauth2.googleapis.com/token', params.toString(), {
	// 			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	// 		});
	// 	} catch (error: any) {
	// 		throw new UnauthorizedException('Failed to get token from Google');
	// 	}

	// 	const { id_token } = tokenResponse.data;
	// 	if (!id_token) throw new UnauthorizedException('No id_token from Google');

	// 	const ticket = await this.googleClient.verifyIdToken({
	// 		idToken: id_token,
	// 		audience: process.env.GOOGLE_CLIENT_ID,
	// 	});

	// 	const payload = ticket.getPayload();
	// 	if (!payload) throw new UnauthorizedException('Invalid Google token');

	// 	const { email, sub: googleId, name, picture, sub: phone } = payload;

	// 	let member = await this.memberModel.findOne({ googleId });
	// 	if (!member) {
	// 		member = await this.memberModel.create({
	// 			googleId,
	// 			memberNick: name,
	// 			memberEmail: email,
	// 			memberImage: picture,
	// 			memberAuthType: MemberAuthType.GOOGLE,
	// 			memberPassword: crypto.randomBytes(16).toString('hex'),
	// 			memberPhone: phone,
	// 		});
	// 	}

	// 	const accessToken = this.jwtService.sign(
	// 		{
	// 			_id: member._id,
	// 			googleId: googleId,
	// 			memberPhone: member.memberPhone,
	// 			memberEmail: member.memberEmail,
	// 			memberNick: member.memberNick,
	// 			memberImage: member.memberImage,
	// 			memberType: member.memberType,
	// 			memberStatus: member.memberStatus,
	// 			memberAuthType: member.memberAuthType,
	// 		},
	// 		{ secret: process.env.JWT_SECRET, expiresIn: '7d' },
	// 	);
	// 	console.log('accessToken =>', accessToken);

	// 	return { accessToken };
	// }
}
