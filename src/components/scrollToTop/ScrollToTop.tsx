import React, { useState, useEffect } from "react";
import { CHAT_SCROLL_PARENT_SELECTOR } from "@src/lib/utilities/chatDom";

const getScrollParent = (): HTMLElement | null => {
    const node = document.querySelector(CHAT_SCROLL_PARENT_SELECTOR);
    return node instanceof HTMLElement ? node : null;
};

export const ScrollToTop = (): JSX.Element => {
    const [isShowingScrollToTopButton, setIsShowingScrollToTopButton] =
        useState(false);
    const [isScrollingToTop, setIsScrollingToTop] = useState(false);

    useEffect(() => {
        const parentDiv = getScrollParent();
        if (!parentDiv) return;

        const handleScroll = () => {
            if (!parentDiv.scrollTop) {
                setIsScrollingToTop(false);
                setIsShowingScrollToTopButton(false);
            } else {
                setIsShowingScrollToTopButton(true);
            }
        };

        const handleScrollEnd = () => setIsScrollingToTop(false);

        handleScroll();

        parentDiv.addEventListener("scroll", handleScroll);
        parentDiv.addEventListener("scrollend", handleScrollEnd);
        return () => {
            parentDiv.removeEventListener("scroll", handleScroll);
            parentDiv.removeEventListener("scrollend", handleScrollEnd);
        };
    }, []);

    const scrollToTop = (): void => {
        const parentDiv = getScrollParent();
        if (!parentDiv) return;
        setIsShowingScrollToTopButton(false);
        setIsScrollingToTop(true);
        parentDiv.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <>
            {isShowingScrollToTopButton && !isScrollingToTop && (
                <button
                    className={
                        "cursor-pointer absolute z-10 rounded-full bg-clip-padding border text-token-text-secondary border-token-border-light left-1/2 rotate-180 translate-x-1/2 bg-token-main-surface-primary w-8 h-8 flex items-center justify-center bottom-5"
                    }
                    onClick={scrollToTop}
                    id="scroll-to-top-btn"
                    type="button"
                    aria-label="Scroll to top"
                >
                    <UpArrow />
                </button>
            )}
        </>
    );
};

const UpArrow = (): JSX.Element => {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="icon-md text-token-text-primary"
            aria-hidden="true"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 21C11.7348 21 11.4804 20.8946 11.2929 20.7071L4.29289 13.7071C3.90237 13.3166 3.90237 12.6834 4.29289 12.2929C4.68342 11.9024 5.31658 11.9024 5.70711 12.2929L11 17.5858V4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4V17.5858L18.2929 12.2929C18.6834 11.9024 19.3166 11.9024 19.7071 12.2929C20.0976 12.6834 20.0976 13.3166 19.7071 13.7071L12.7071 20.7071C12.5196 20.8946 12.2652 21 12 21Z"
                fill="currentColor"
            ></path>
        </svg>
    );
};
