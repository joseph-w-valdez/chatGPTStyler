interface removeUnnecessarySpaceTypes {
    userTextContainer: HTMLElement[];
    inputBoxContainer: HTMLDivElement;
}

export const removeUnnecessarySpace = ({
    userTextContainer,
    inputBoxContainer,
}: removeUnnecessarySpaceTypes): void => {
    inputBoxContainer.classList.remove("max-w-(--thread-content-max-width)");
    inputBoxContainer.classList.remove("gap-4");
    inputBoxContainer.classList.remove("md:gap-5");
    inputBoxContainer.classList.remove("lg:gap-6");

    userTextContainer.forEach((element) => {
        element.classList.remove("rounded-[18px]");
        element.classList.remove("px-5");
        element.classList.remove("max-w-[var(--user-chat-width,70%)]");
        element.classList.remove("user-message-bubble-color");
        element.classList.remove("px-4");
        element.classList.remove("py-1.5");
        element.classList.remove("data-[multiline]:py-3");
        element.style.maxWidth = "100%";
    });
};
