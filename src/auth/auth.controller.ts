import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() body: any) {
    const user = await this.authService.signup(body);
    return { id: user.id, email: user.email, role: user.role };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

  // @Post('login')
  // async login(
  //   @Body() dto: { email: string; password: string },
  //   @Res({ passthrough: true }) res: Response,
  // ) {
  //   const user = await this.auth.validateUser(dto.email, dto.password);
  //   const token = await this.auth.signJwt(user); // payload: { sub, email, role, ... }

  //   const isProd = process.env.NODE_ENV === 'production';

  //   res.cookie('access_token', token, {
  //     httpOnly: true, // ✅ กัน JS ฝั่งหน้าเว็บอ่าน
  //     secure: isProd, // ✅ ต้อง true ถ้า SameSite=None (prod ใช้ HTTPS)
  //     sameSite: isProd ? 'none' : 'lax',
  //     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 วัน
  //     path: '/',
  //   });

  //   return { user }; // ไม่ต้องส่ง token กลับแล้ว
  // }
}
