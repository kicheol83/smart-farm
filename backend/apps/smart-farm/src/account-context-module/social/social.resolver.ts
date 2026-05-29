import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from '../auth/auth.service';
import {
  AppleAuthInput,
  GoogleAuthInput,
  SocialAuthResponse,
} from '../../libs/dto/auth/social';
import { SocialService } from './social.service';

@Resolver()
export class SocialResolver {
  constructor(
    private readonly socialService: SocialService,
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => SocialAuthResponse, {
    description:
      'Google Sign-In — frontend dan kelgan idToken bilan login/register',
  })
  async googleAuth(
    @Args('input') input: GoogleAuthInput,
  ): Promise<SocialAuthResponse> {
    return this.socialService.googleAuth(input.idToken, (member) =>
      this.authService.createToken(member),
    );
  }

  @Mutation(() => SocialAuthResponse, {
    description:
      'Apple Sign In — frontend dan kelgan identityToken bilan login/register',
  })
  async appleAuth(
    @Args('input') input: AppleAuthInput,
  ): Promise<SocialAuthResponse> {
    return this.socialService.appleAuth(
      input.identityToken,
      input.fullName,
      (member) => this.authService.createToken(member),
    );
  }
}
