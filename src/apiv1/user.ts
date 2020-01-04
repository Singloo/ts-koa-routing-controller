import {
  JsonController,
  Param,
  Body,
  Get,
  Post,
  Ctx,
} from 'routing-controllers'
import { getMongoRepository } from 'typeorm'
import { Line } from '../db/entities'
import Koa from 'koa'

@JsonController()
export default class UserController {
  @Get('/')
  async getAll(@Ctx() ctx: Koa.Context) {
    const res = await getMongoRepository(Line).find({})
    // return res.length
    ctx.body = ctx.isAuthenticated()
    return res.length
  }

  @Get('/users/:id')
  getOne(@Param('id') id: number) {
    return 'hello'
  }

  @Post('/users')
  post(@Body() body: any, @Ctx() ctx: Koa.Context) {
    console.log(body)
    return 'success'
  }
}
