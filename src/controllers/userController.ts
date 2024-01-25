import { RequestHandler } from 'express';
import { genSaltSync, hashSync, compareSync } from "bcrypt";
import User from '../model/schema';
import jwt from "jsonwebtoken";
export const register: RequestHandler = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        const pass:RegExp=  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/;
    
        // check input for correctness
        if (!pass.test(password.toString())) {
          return res.status(407).json({ message: 'Enter valid password with uppercase, lowercase, number & @' });
        }
        if (!expression.test(email.toString())) {
          return res.status(407).json({ message: 'Enter valid email' });
        }
        // if(typeof phone !== 'number' && (""+phone).length !== 10 ) {
        //   return res.status(407).json({ message: 'Phone number should only have 10 digits, No character allowed.' });
        // }

    const existinguser = await User.findOne({ email });
//if user is already exist
    if (existinguser) {
      return res.status(407).json({ message: 'User already Exist' });
    }
    //hashing password
    const salt = genSaltSync(10);
    const hashPassword = hashSync(password, salt);
    const newUser = new User({
      name,
      email,
      password: hashPassword,

    });
    //save new user
    await newUser.save();
    res.status(200).json({ message: 'registred successfully' })

  } catch (err) {
    res.status(407).json({ message: err });

  }

};

export const login:RequestHandler = async(req, res, next) => {
    try{
        const {email,password} = req.body ;

        const user = await User.findOne({email}) ;

        // Checking if the email exists in database 
        if(!user){
            return res.status(400).json({ok:false,message:"Invalid Credentials"}) ;
        }

        // comapring password entered with database hashed Password
        const isPasswordMatch = await compareSync(password,user.password) ;
        if(!isPasswordMatch){
            return res.status(400).json({ok:false,message:"Invalid Credentials"}); 
        }

        // Generating tokens
        const authToken = jwt.sign({userId : user.id},process.env.JWT_SECRET_KEY||" ",{expiresIn : '30m'}) ;
        const refreshToken = jwt.sign({userId : user.id},process.env.JWT_REFRESH_SECRET_KEY||" ",{expiresIn : '2h'}) ;

        // Saving tokens in cookies 
        res.cookie('authToken',authToken,({httpOnly : true})) ;
        res.cookie('refreshToken',refreshToken,({httpOnly:true})) ;

        return res.status(200).json({ok:true,message : "Login Successful",user, token:authToken}) ;

    }
    catch(err){
        next(err) ;
    }
    
};

export const logout:RequestHandler = (req, res, next) => {
    try{
        res.clearCookie('authToken') ;
        res.clearCookie('refreshToken');
        return res.status(200).json({ok:true,message:"User has been logged out"}) ;
    }
    catch(err){
        next(err) ;
    }
};
