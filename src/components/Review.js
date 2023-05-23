import { PeraWalletConnect } from '@perawallet/connect';
import React from 'react';
import useWallet from "../hooks/useWallet";
import IconBxsLike from './IconBxsLike';
const peraWallet = new PeraWalletConnect();


const Review = ({ likes, selfLike, noopLike }) => {



    return (
        <div className="review">
            <h1>
                <span>Do you like this DApp?</span>
                <IconBxsLike
                    selfLike={selfLike}
                    noopLike={noopLike}
                />
            </h1>
            <p> <span>{likes}</span> User/s liked this DApp</p>
        </div>
    );
};

export default Review;