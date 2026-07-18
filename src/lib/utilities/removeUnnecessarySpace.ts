interface RemoveUnnecessarySpaceTypes {
    userTextContainer: ArrayLike<Element>;
    inputBoxContainer: Element | null;
}

export const removeUnnecessarySpace = ({
    userTextContainer,
    inputBoxContainer,
}: RemoveUnnecessarySpaceTypes): void => {
    if (inputBoxContainer instanceof HTMLElement) {
        inputBoxContainer.classList.remove(
            "max-w-(--thread-content-max-width)",
        );
        inputBoxContainer.classList.remove("gap-4");
        inputBoxContainer.classList.remove("md:gap-5");
        inputBoxContainer.classList.remove("lg:gap-6");
    }

    Array.from(userTextContainer).forEach((element) => {
        if (!(element instanceof HTMLElement)) return;
        element.classList.remove("items-end");
        const firstChild = element.children[0];
        if (firstChild instanceof HTMLElement) {
            firstChild.classList.remove("px-5");
        }
    });
};
