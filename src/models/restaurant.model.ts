// restaurant.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Restaurant extends Document {
  @Prop({ required: true })
  name: string;
  @Prop()
  address: string;
  @Prop()
  mobile: number;
  @Prop()
  rating: number;

}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
