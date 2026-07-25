import { ObjectType, InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

@ObjectType()
export class Farm {
  @Field(() => ID)
  _id: string;

  @Field()
  farmName: string;

  @Field()
  farmLocation: string;

  @Field({ nullable: true, description: 'Farm tavsifi (2026 boyitish)' })
  farmDescription?: string;

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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  farmDescription?: string;
}

@InputType()
export class UpdateFarmInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  farmName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  farmLocation?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  farmDescription?: string;
}
