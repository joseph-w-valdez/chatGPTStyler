import React, { useState, useEffect } from "react";
export function ScrollToTop() {
    const [isScrolledToTop, setIsScrolledToTop] = useState(true);
    const [isShowing, setIsShowing] = useState(true);
    const parentDiv = document.querySelector('div[role="presentation"] > div > div > div');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolledToTop(!!parentDiv?.scrollTop);
            if (!!parentDiv?.scrollTop) {
                setIsShowing(true);
            }
        };
        parentDiv?.addEventListener('scroll', handleScroll);
        return () => parentDiv?.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        setIsShowing(false);
        parentDiv?.scrollTo({ top: 0, behavior: "smooth" });
    };

    return <button 
                className={`bg-token-main-surface-primary w-[34px] h-[34px] absolute z-10 rounded-full bg-clip-padding border text-token-text-secondary border-token-border-light left-1/2 bottom-5 ${isShowing && !isScrolledToTop ? '' : 'hidden'} cursor-pointer`}
                onClick={scrollToTop}
                id="scroll-to-top"
            >
                <UpArrow />
            </button>
}

const UpArrow = () => {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="m-1 text-token-text-primary transform rotate-180"
        >
            <path
                d="M17 13L12 18L7 13M12 6L12 17"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};