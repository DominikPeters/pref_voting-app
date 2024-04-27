function createEmptyIndifferenceClass() {
    const emptyIndifferenceClass = document.createElement('div');
    emptyIndifferenceClass.classList.add('weak-order-indifference-class');
    return emptyIndifferenceClass;
}

function removeEmptyIndifferenceClasses(weakOrder) {
    const emptyIndifferenceClasses = [...weakOrder.querySelectorAll('.weak-order-indifference-class')].filter(indifferenceClass => {
        return indifferenceClass.children.length === 0;
    });

    emptyIndifferenceClasses.forEach(emptyIndifferenceClass => {
        emptyIndifferenceClass.remove();
    });
}

function getIndifferenceClassAtX(weakOrder, x) {
    
    const classes = [...weakOrder.querySelectorAll('.weak-order-indifference-class')];
    
    let nextClass = classes.find(elem => {
        return x <= elem.getBoundingClientRect().left + elem.getBoundingClientRect().width;
    });

    if (!nextClass) {
        nextClass = classes[classes.length - 1];
    }

    return nextClass;
}

function getItemAtX(indifferenceClass, x) {
    const items = [...indifferenceClass.querySelectorAll('.weak-order-item:not(.weak-order-dragging)')];

    let nextItem = items.find(item => {
        return x <= item.getBoundingClientRect().left + item.getBoundingClientRect().width / 2;
    });

    return nextItem;
}

function getCurrentWeakOrder(weakOrderDiv) {
    const indifferenceClasses = [...weakOrderDiv.querySelectorAll('.weak-order-indifference-class')];
    return indifferenceClasses.map(indifferenceClass => {
        return [...indifferenceClass.querySelectorAll('.weak-order-item')].map(item => {
            return item.textContent;
        });
    });
}

export function createWeakOrder({initialWeakOrder, onChange, trash, onTrashDrop}) {
    // input: something like [[0,1],[2],[3]], but each of them is a div
    const weakOrderDiv = document.createElement("div");
    weakOrderDiv.classList.add("weak-order");

    const itemDivs = [];

    for (const indifferenceClass of initialWeakOrder) {
        const indifferenceClassDiv = document.createElement("div");
        indifferenceClassDiv.classList.add("weak-order-indifference-class");
        for (const itemDiv of indifferenceClass) {
            itemDiv.classList.add("weak-order-item");
            itemDiv.draggable = true;
            indifferenceClassDiv.appendChild(itemDiv);
            itemDivs.push(itemDiv);
        }
        weakOrderDiv.appendChild(indifferenceClassDiv);
    }

    // put in minimum width so it is always possible to separate all items
    weakOrderDiv.style.minWidth = `${itemDivs.length * (32.5 + 10)}px`;

    itemDivs.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            item.classList.add('weak-order-dragging');
            item.dataset.justStartedDragging = true;
            e.dataTransfer.setData('text/plain', item.textContent); // safari needs this
            e.dataTransfer.effectAllowed = "move"; // cursor
            trash.style.display = 'inline-block';
        })

        item.addEventListener('dragend', () => {
            // is item in trash?
            if (trash.contains(item)) {
                if (onTrashDrop) {
                    onTrashDrop(item);
                }
            }
            removeEmptyIndifferenceClasses(weakOrderDiv);
            item.classList.remove('weak-order-dragging');
            trash.style.display = 'none';
        })
    })

    trash.addEventListener('dragover', e => {
        const item = document.querySelector('.weak-order-dragging');

        // check if item can be dropped here (originates from the right weak order)
        if (!itemDivs.includes(item)) {
            return;
        }
        e.preventDefault();

        trash.appendChild(item);
    });

    weakOrderDiv.addEventListener('dragover', e => {
        const item = document.querySelector('.weak-order-dragging');

        // check if item can be dropped here (originates from the same weak order)
        if (!itemDivs.includes(item)) {
            return;
        }
        e.preventDefault();

        const indifferenceClasses = [...weakOrderDiv.querySelectorAll('.weak-order-indifference-class')];

        // target indifference class
        const indifferenceClass = getIndifferenceClassAtX(weakOrderDiv, e.clientX);

        // is it currently empty, so that the item will create a "new" indifference class?
        const indifferenceClassEmpty = indifferenceClass.children.length === 0;

        // optimization: store information for later
        // if the indifference class hasn't changed, we don't need to update empty indifference classes later
        // exception: when we just started dragging, we need to draw initial new empty indifference classes
        const stayedInSameIndifferenceClass = indifferenceClass == item.parentElement;
        const justStartedDragging = item.dataset.justStartedDragging;
        item.dataset.justStartedDragging = "";

        // place item
        const afterElement = getItemAtX(indifferenceClass, e.clientX);
        const shouldAnimate = !stayedInSameIndifferenceClass && !indifferenceClassEmpty;
        const animationOptions = { duration: 70, easing: 'ease-in-out' }
        if (afterElement == null) {
            if (shouldAnimate) {
                item.animate([{ marginLeft: 'var(--indifference-class-gap)' }, { marginLeft: '0' }], animationOptions);
            }
            indifferenceClass.appendChild(item);
        } else {
            if (shouldAnimate) {
                item.animate([{ marginRight: 'var(--indifference-class-gap)' }, { marginRight: '0' }], animationOptions);
            }
            indifferenceClass.insertBefore(item, afterElement);
        }

        // skip unnecessary updates
        if (stayedInSameIndifferenceClass && !justStartedDragging) {
            return;
        }

        // delete empty indifference classes
        removeEmptyIndifferenceClasses(weakOrderDiv);

        onChange(getCurrentWeakOrder(weakOrderDiv));

        // make empty indifference classes
        if (indifferenceClass.children.length >= 2) {
            // left
            const leftEmptyIndifferenceClass = createEmptyIndifferenceClass();
            weakOrderDiv.insertBefore(leftEmptyIndifferenceClass, indifferenceClass);
            // right
            const rightEmptyIndifferenceClass = createEmptyIndifferenceClass();
            weakOrderDiv.insertBefore(rightEmptyIndifferenceClass, indifferenceClass.nextElementSibling);
        }
    })

    return weakOrderDiv;
}