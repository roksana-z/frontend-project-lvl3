export default (parsedNews) => {
    const itemContainer = document.createElement('div');
    parsedNews.news.forEach(item => {
        const a = document.createElement('a');
        const div = document.createElement('div');
        a.setAttribute('href', item.link);
        a.innerHTML = item.text;
        div.append(a);
        itemContainer.append(div)
    })
        
    const h2 = document.createElement('h2');
    h2.innerHTML= parsedNews.title;
    itemContainer.prepend(h2);
        
    itemContainer.classList.add('mb-30')
    return  itemContainer;
}