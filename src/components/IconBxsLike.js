import React, { useEffect, useState } from "react";

function IconBxsLike({ props, likes, selfLike, noopLike }) {

    const [liked, setLiked] = useState(null);
    const [unLiked, setUnLiked] = useState(null);

    useEffect(() => {
        if (!!selfLike) {
            setLiked(!liked);
            if (unLiked) {
                setUnLiked(false);
            }
        } else {
            setUnLiked(!unLiked);
            if (liked) {
                setLiked(false);
            }
        }
    }, [props, likes, selfLike]);

    const handleClick1 = async () => {
        await noopLike("Like");
        setLiked(!liked);
        if (unLiked) {
            setUnLiked(false);
        }
    };

    const handleClick2 = async () => {
        await noopLike("Unlike");
        setUnLiked(!unLiked);
        if (liked) {
            setLiked(false);
        }
    };

    const fill1 = liked ? "#ff88b1" : "white";
    const fill2 = unLiked ? "#ff88b1" : "white";
    const size1 = liked ? "1.5em" : "1em";
    const size2 = unLiked ? "1.5em" : "1em";

    return (
        <>
            <svg
                viewBox="0 0 24 24"
                fill={fill1}
                height={size1}
                width={size1}
                onClick={handleClick1}
                {...props}
            >
                <path d="M4 21h1V8H4a2 2 0 00-2 2v9a2 2 0 002 2zM20 8h-7l1.122-3.368A2 2 0 0012.225 2H12L7 7.438V21h11l3.912-8.596L22 12v-2a2 2 0 00-2-2z" />
            </svg>
            <svg
                viewBox="0 0 24 24"
                fill={fill2}
                height={size2}
                width={size2}
                onClick={handleClick2}
                {...props}
            >
                <path d="M20 3h-1v13h1a2 2 0 002-2V5a2 2 0 00-2-2zM4 16h7l-1.122 3.368A2 2 0 0011.775 22H12l5-5.438V3H6l-3.937 8.649-.063.293V14a2 2 0 002 2z" />
            </svg>
        </>
    );
}

export default IconBxsLike;


