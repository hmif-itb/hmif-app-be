import {
    Controller,
    Get,
    HttpStatus,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { AuthService } from './auth.service';
  import { GoogleOauthGuard } from './guards/google-oauth.guard';
  
  @Controller('auth')
  export class AuthController {
    constructor(private authService: AuthService) {}
  
    @Get('google')
    @UseGuards(GoogleOauthGuard)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async auth() {}
  }i