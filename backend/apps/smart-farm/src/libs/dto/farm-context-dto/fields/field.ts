import { ObjectType, InputType, Field, ID, Float } from '@nestjs/graphql';
import { IsMongoId, IsNumber, IsPositive, IsOptional } from 'class-validator';

@ObjectType()
export class FieldEntity {
  @Field(() => ID)
  _id: string;

  @Field(() => Float, { description: '(m²)' })
  fieldsArea: number;

  @Field(() => ID)
  cropsId: string;

  @Field(() => ID, { nullable: true })
  sectionsId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateFieldInput {
  @Field(() => Float)
  @IsNumber()
  @IsPositive({ message: 'fieldsArea must be positive' })
  fieldsArea: number;

  @Field(() => ID)
  @IsMongoId()
  cropsId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  sectionsId?: string;
}

@InputType()
export class UpdateFieldInput {
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  fieldsArea?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  cropsId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  sectionsId?: string;
}
