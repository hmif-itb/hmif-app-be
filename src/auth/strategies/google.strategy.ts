import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20"
import { Injectable } from "@nestjs/common"
import 'dotenv/config';


@Injectable()

export class GoogleStrategy extends PassportStrategy(Strategy, 'google'){
    constructor(){
        super({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
            scope: ['email', 'profile']
        })
    }
    async validate (accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) :
        Promise<any>{
            const {name, emails, photos} = profile
            const user = {
                email: emails[0].value,
                fistName: name.givenName,
                lastName: name.familyName,
                picture: photos[0].value,
                accessToken
            }
            done(null, user)
        }
}