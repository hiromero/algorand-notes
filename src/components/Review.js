import React from 'react';
import IconBxsLike from './IconBxsLike';

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