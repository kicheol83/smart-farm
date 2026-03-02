import { registerEnumType } from "@nestjs/graphql";

export enum Direction {
  ASC = 1,
  DESC = -1,
}
registerEnumType(Direction, {
  name: 'Direction',
});
