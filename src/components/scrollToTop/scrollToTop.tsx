import React, { useState, useEffect } from "react";

export const ScrollToTop = () => {
    const [isShowingScrollToTopButton, setIsShowingScrollToTopButton] =
        useState<boolean | null>(null);
    const [isScrollingToTop, setIsScrollingToTop] = useState<boolean | null>(
        false,
    );
    const parentDiv = document.querySelector(
        'div[role="presentation"] > div > div > div',
    );

    useEffect(() => {
        const handleScroll = () => {
            if (!parentDiv) return;
            // If the scrollTop is 0, the user is at the top of the page
            if (!parentDiv.scrollTop) {
                setIsScrollingToTop(false);
                setIsShowingScrollToTopButton(false);
            } else {
                // Otherwise, the button should be visible
                setIsShowingScrollToTopButton(true);
            }
        };

        const handleScrollEnd = () => setIsScrollingToTop(false); // Reset isScrollingToTop after scroll ends

        if (!parentDiv) return;

        // Initial check for scrollTop when the component mounts and when the user changes conversation threads
        handleScroll();

        parentDiv.addEventListener("scroll", handleScroll);
        parentDiv.addEventListener("scrollend", handleScrollEnd); // Event listener for the end of the scroll
        return () => {
            parentDiv.removeEventListener("scroll", handleScroll);
            parentDiv.removeEventListener("scrollend", handleScrollEnd);
        };
    }, []);

    const scrollToTop = () => {
        setIsShowingScrollToTopButton(false);
        setIsScrollingToTop(true);
        parentDiv!.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <>
            {/* This is only rendered if the user is scrolled down and the user is not currently scrolling to the top. The button is hidden during the scroll to prevent more clicks. */}
            {isShowingScrollToTopButton && !isScrollingToTop && (
                <button
                    className={`bg-token-main-surface-primary w-[34px] h-[34px] absolute z-10 rounded-full bg-clip-padding border text-token-text-secondary border-token-border-light left-1/2 bottom-5 cursor-pointer`}
                    onClick={scrollToTop}
                    id="scroll-to-top-btn"
                >
                    <UpArrow />
                </button>
            )}
        </>
    );
};

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
