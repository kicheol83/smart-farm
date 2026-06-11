import { ObjectType, InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@ObjectType()
export class Farm {
  @Field(() => ID)
  _id: string;

  @Field()
  farmName: string;

  @Field()
  farmLocation: string;

  @Field(() => ID)
  memberId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateFarmInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'farmName is required' })
  farmName: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'farmLocation is required' })
  farmLocation: string;
}

@InputType()
export class UpdateFarmInput {
  @Field({ nullable: true })
  @IsString()
  farmName?: string;

  @Field({ nullable: true })
  @IsString()
  farmLocation?: string;
}