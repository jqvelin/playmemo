class Game {
    IS_PAUSED = true;

    ANIMATION_DURATION = 2000;
    FLIP_DURATION = 500;
    CARDS_STAY_FLIPPED_FOR = 1000;

    STOPWATCH = {
        INTERVAL: null,
        SCORE: 0
    };

    HIGHSCORE = parseInt(localStorage.getItem("playmemoHighscore"));

    FLIPPED_CARDS = [];

    constructor(rootElement) {
        this.rootElement = rootElement;
        this.rootElement.addEventListener("click", this.handleClick);
    }

    init(itemList) {
        this.itemList = itemList;
        this.setupCardObjects();
        this.renderCardObjects();

        this.animateInitialFlip();
        setTimeout(() => {
            this.checkForFirstLaunch();
            this.runStopwatch();
        }, this.ANIMATION_DURATION);
    }

    setupCardObjects() {
        const cardObjects = [];

        this.itemList.forEach((item) => {
            cardObjects.push(
                new CardObject({
                    id: Math.floor(Math.random() * 1e8),
                    title: item.title,
                    iconSrc: item.iconSrc
                }),
                new CardObject({
                    id: Math.floor(Math.random() * 1e8),
                    title: item.title,
                    iconSrc: item.iconSrc
                })
            );
        });

        // Shuffle
        cardObjects.sort(() => (Math.random() > 0.5 ? 1 : -1));

        this.cardObjects = cardObjects;
    }

    renderCardObjects() {
        if (this.rootElement.children.length) {
            this.cardObjects.forEach((cardObject, index) => {
                const cardElement = this.rootElement.children[index];
                cardElement.dataset.id = cardObject.id;
                cardObject.element = cardElement;
            });
        } else {
            this.cardObjects.forEach((cardObject, index) => {
                const cardElement = document.createElement("div");
                cardObject.element = cardElement;
                cardElement.dataset.id = cardObject.id;
                cardElement.className = "game__card";

                if (index === 0 || index === 1) {
                    const pointer = document.createElement("img");
                    pointer.className = "game__card-pointer hidden";
                    pointer.src = "assets/icons/pointer.svg";
                    cardElement.append(pointer);
                }

                const cardElementContent = document.createElement("div");
                cardElementContent.className = "game__card-content";

                const cardElementFrontSide = document.createElement("div");
                cardElementFrontSide.classList = "game__card-content-front";

                const cardElementBackSide = document.createElement("div");
                cardElementBackSide.classList = "game__card-content-back";

                const cardElementBackSideIcon = document.createElement("img");
                cardElementBackSide.append(cardElementBackSideIcon);

                cardElementContent.append(
                    cardElementFrontSide,
                    cardElementBackSide
                );

                cardElement.appendChild(cardElementContent);
                this.rootElement.appendChild(cardElement);
            });
        }
    }

    animateInitialFlip() {
        window.addEventListener("load", () => {
            const onLoadDelay = 500;
            setTimeout(() => {
                this.animateFlip(this.ANIMATION_DURATION - onLoadDelay);
            }, onLoadDelay);
        });
    }

    #flipCard(cardObject) {
        const cardElement = cardObject.element;
        if (!cardElement.classList.contains("flipped")) {
            const cardElementBackSide = cardElement.querySelector(
                ".game__card-content-back"
            );

            const icon = cardElementBackSide.querySelector("img");
            icon.src = cardObject.iconSrc;
            cardElementBackSide.append(icon);

            cardElement.classList.add("flipped");

            this.FLIPPED_CARDS.push(cardObject);

            if (this.FLIPPED_CARDS.length === 2) {
                this.checkGuess();
            }
        } else {
            cardElement.classList.remove("flipped");
            setTimeout(() => {
                const cardElementBackSide = cardElement.querySelector(
                    ".game__card-content-back"
                );
                const icon = cardElementBackSide.querySelector("img");
                icon.src = "";
            }, this.FLIP_DURATION);
        }
    }

    checkGuess() {
        const firstFlippedCard = this.FLIPPED_CARDS[0];
        const secondFlippedCard = this.FLIPPED_CARDS[1];

        if (firstFlippedCard.iconSrc !== secondFlippedCard.iconSrc) {
            this.IS_PAUSED = true;
            setTimeout(() => {
                this.#flipCard(firstFlippedCard);
                this.#flipCard(secondFlippedCard);
                this.FLIPPED_CARDS.length = 0;
            }, this.CARDS_STAY_FLIPPED_FOR);
            setTimeout(() => {
                this.IS_PAUSED = false;
            }, this.CARDS_STAY_FLIPPED_FOR + this.FLIP_DURATION);
        } else {
            this.FLIPPED_CARDS.length = 0;
            this.checkGameOutcome();
        }
    }

    checkGameOutcome() {
        if (
            this.cardObjects.every((cardObject) =>
                cardObject.element.classList.contains("flipped")
            )
        ) {
            clearInterval(this.STOPWATCH.INTERVAL);
            if (this.STOPWATCH.SCORE < this.HIGHSCORE || !this.HIGHSCORE) {
                this.HIGHSCORE = this.STOPWATCH.SCORE;
                this.highscoreElement.textContent = this.STOPWATCH.SCORE;
                localStorage.setItem("playmemoHighscore", this.STOPWATCH.SCORE);
            }
        }
    }

    restart = () => {
        if (this.IS_PAUSED) return;
        this.animateFlip(this.ANIMATION_DURATION);
        clearInterval(this.STOPWATCH.INTERVAL);
        this.FLIPPED_CARDS.length = 0;
        setTimeout(() => {
            this.setupCardObjects(this.itemList);
            this.renderCardObjects();
            this.STOPWATCH.SCORE = 0;
            this.runStopwatch();
        }, this.ANIMATION_DURATION);
    };

    animateFlip(duration) {
        this.IS_PAUSED = true;

        const freeDuration = duration - this.FLIP_DURATION * 2;
        const delaysBetweenAnimation = this.cardObjects.length - 1;
        const animationDelayBetweenCardElements =
            freeDuration / delaysBetweenAnimation;

        this.cardObjects.forEach((cardObject, index) => {
            const cardElement = cardObject.element;

            setTimeout(() => {
                if (cardElement.classList.contains("flipped")) {
                    const cardElementIcon = cardElement.querySelector(
                        ".game__card-content-back img"
                    );
                    cardElement.classList.remove("flipped");
                    setTimeout(() => {
                        cardElementIcon.src = "";
                        cardElement.classList.add("flipped");
                    }, this.FLIP_DURATION);
                } else {
                    cardElement.classList.add("flipped");
                }
            }, index * animationDelayBetweenCardElements);

            setTimeout(() => {
                cardElement.classList.remove("flipped");
                setTimeout(() => (this.IS_PAUSED = false), this.FLIP_DURATION);
            }, duration);
        });
    }

    handleClick = (e) => {
        const clickedCardElement = e.target.closest(".game__card");

        if (
            this.IS_PAUSED ||
            !clickedCardElement ||
            clickedCardElement.classList.contains("flipped") ||
            this.FLIPPED_CARDS.length === 2
        )
            return;

        const cardObject = this.cardObjects.find((cardObject) => {
            return cardObject.id === parseInt(clickedCardElement.dataset.id);
        });

        this.#flipCard(cardObject);
    };

    checkForFirstLaunch() {
        if (!localStorage.getItem("playmemoHighscore")) {
            const pointer = this.cardObjects[0].element.querySelector(
                ".game__card-pointer"
            );
            pointer.classList.remove("hidden");

            const firstClick = () => {
                pointer.classList.add("hidden");
                this.rootElement.removeEventListener("click", firstClick);

                const secondClick = () => {
                    const pointer2 = this.cardObjects[1].element.querySelector(
                        ".game__card-pointer"
                    );
                    pointer2.classList.remove("hidden");

                    const endTraining = () => {
                        pointer2.classList.add("hidden");
                        this.rootElement.removeEventListener(
                            "click",
                            endTraining
                        );
                    };

                    this.rootElement.addEventListener("click", endTraining);
                };
                secondClick();
                localStorage.setItem("playmemoHighscore", "0");
            };

            this.rootElement.addEventListener("click", firstClick);
        }
    }

    renderScoreTo(HTMLElement) {
        this.scoreElement = HTMLElement;
        this.scoreElement.textContent = this.STOPWATCH.SCORE;
    }

    renderHighscoreTo(HTMLElement) {
        this.highscoreElement = HTMLElement;
        this.highscoreElement.textContent = this.HIGHSCORE;
    }

    runStopwatch() {
        if (!this.scoreElement) return;
        this.STOPWATCH.INTERVAL = setInterval(() => {
            this.STOPWATCH.SCORE++;
            this.scoreElement.textContent = this.STOPWATCH.SCORE;
        }, 1000);
    }
}

class CardObject {
    constructor(options) {
        const { id, iconSrc } = options;
        this.id = id;
        this.iconSrc = iconSrc;
    }
}
