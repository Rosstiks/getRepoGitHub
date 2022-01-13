const inputArea = document.querySelector('.search-block__input');
const searchResults = document.querySelector('.search-block__result');
const searchDescription = document.querySelector('.search-block__description');
const savedList = document.querySelector('.save-search__list');
let currentSearchResults = [];
searchGitRepo = debounce(searchGitRepo);

const searchResultsListener = (e) => {
    if (e.target.classList.contains('search-block__item')) {
        let selectedElement = currentSearchResults.find(el => el.id == e.target.dataset.id);
        createSavedListItem(selectedElement);
        inputArea.value = '';
        clearResultArea();
        inputArea.classList.remove('search-block__input--active');
        searchResults.classList.remove('search-block__result--active');
    }
}

const savedListListener = (e) => {
    if (e.target.classList.contains('save-search__delete-button')) {
        e.target.closest('.save-search__list-item').remove();
    }
}

inputArea.addEventListener('input', () => {
    clearResultArea();
    if (inputArea.value === '' || !inputArea.value.trim().length) {
        inputArea.classList.remove('search-block__input--active');
        searchResults.classList.remove('search-block__result--active');
        searchResults.removeEventListener('click', searchResultsListener)
    } else {
        inputArea.classList.add('search-block__input--active');
        searchResults.classList.add('search-block__result--active');
        searchDescription.textContent = 'Insert keyword for search repositories';
        searchResults.addEventListener('click', searchResultsListener);
        searchGitRepo(inputArea.value);
    }
})

const emptyListObserver = new MutationObserver(() => {
    if (savedList.children.length > 0) {
        savedList.classList.remove('save-search__list--empty');
        savedList.addEventListener('click', savedListListener);
    } else {
        savedList.classList.add('save-search__list--empty');
        savedList.removeEventListener('click', savedListListener);
    }
});

emptyListObserver.observe(savedList, {childList: true})

function createSavedListItem (repo) {
    const avatarURL = repo.owner.avatar_url;
    const ownerText = `<b>Owner:</b><br>${repo.owner.login}`;
    const nameText = `<b>Name:</b><br>${repo.name}`;
    const starsText = `<b>Stars:</b><br>${repo.stargazers_count}`;

    const savedEl = createNodeElement('li', 'list-item')
    const savedElOwnerAvatar = createNodeElement('img', 'item-avatar', null, avatarURL)
    const savedElOwner = createNodeElement('div', 'item-owner', ownerText)
    const savedElName = createNodeElement('div', 'item-name', nameText)
    const savedElStars = createNodeElement('div', 'item-stars', starsText)
    const savedElDeleteButton = createNodeElement('bytton', 'delete-button')

    savedEl.append(savedElOwnerAvatar, savedElOwner, savedElName, savedElStars, savedElDeleteButton);
    savedList.append(savedEl);
}

function createNodeElement(tag, className, insertHTML, src) {
    const el = document.createElement(tag);
    el.classList.add(`save-search__${className}`);
    if (insertHTML) {
        el.insertAdjacentHTML('afterbegin', insertHTML)
    }
    if (src) {
        el.src = src;
    }
    return el;
}

function clearResultArea(){
    [...searchResults.children].forEach(el => {
        if (el.classList.contains('search-block__item')) el.remove();
    })
}

async function searchGitRepo (value) {
    try {
        let response = await fetch(`https://api.github.com/search/repositories?q=${value}&per_page=5&sort=stars&order=desc`);
        let result = await response.json();
        currentSearchResults = [...result.items];
        searchResults.prepend(...createSearchResults(result.items))
        if (result.items.length === 0) {
            searchDescription.textContent = 'Sorry, there are no results for your request'
        } else {
            searchDescription.textContent = 'To save the repository, click on the desired result'
        }
    } catch (e) {
        console.log(e)
    }
}

function createSearchResults(results) {
    return results.map(el => {
        let searchEl = document.createElement('div');
        searchEl.classList.add('search-block__item');
        searchEl.textContent = `${el.name}, stars: ${el['stargazers_count']}`;
        searchEl.dataset.id = el.id;
        return searchEl;
    });
}

function debounce(fn) {
    let timeout;
    return function() {
        const fnCall = () => fn.apply(this, arguments);
        clearTimeout(timeout);
        timeout = setTimeout(fnCall, 700)
    }
}

