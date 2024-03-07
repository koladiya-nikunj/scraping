import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant } from 'src/models/restaurant.model';

@Injectable()
export class RestaurantService {
  constructor(@InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>) {}

  async create(restaurantDetails: { name: string; address:string; mobile:string; rating:number }): Promise<Restaurant> {
    const createdRestaurant = new this.restaurantModel(restaurantDetails);
    return createdRestaurant.save();
  }
}
