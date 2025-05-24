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
        element.classList.remove("items-end");
        const firstChild = element.children[0] as HTMLElement | undefined;
        if (firstChild) {
            firstChild.classList.remove("px-5");
        }
    });
};
