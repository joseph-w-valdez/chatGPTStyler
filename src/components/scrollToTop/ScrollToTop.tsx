import React, { useState, useEffect } from "react";
import {
    CHAT_SCROLL_PARENT_SELECTOR,
    SCROLL_TO_TOP_BUTTON_CLASS_NAME,
    SCROLL_TO_TOP_BUTTON_STYLE,
} from "@src/lib/utilities/chatDom";

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
                    className={SCROLL_TO_TOP_BUTTON_CLASS_NAME}
                    style={SCROLL_TO_TOP_BUTTON_STYLE}
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
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="icon text-token-text-primary"
            aria-hidden="true"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 3C12.2652 3 12.5196 3.10536 12.7071 3.29289L19.7071 10.2929C20.0976 10.6834 20.0976 11.3166 19.7071 11.7071C19.3166 12.0976 18.6834 12.0976 18.2929 11.7071L13 6.41421V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V6.41421L5.70711 11.7071C5.31658 12.0976 4.68342 12.0976 4.29289 11.7071C3.90237 11.3166 3.90237 10.6834 4.29289 10.2929L11.2929 3.29289C11.4804 3.10536 11.7348 3 12 3Z"
                fill="currentColor"
            ></path>
        </svg>
    );
};
