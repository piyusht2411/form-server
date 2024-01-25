import { Schema, model } from 'mongoose';

interface User {
  name: string;
  email: string;
  password: string;

}

const schema = new Schema<User>({
  name: {
    type: String,
    required: true
  },
 
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
}, { timestamps: true });


export default model<User>('User', schema)