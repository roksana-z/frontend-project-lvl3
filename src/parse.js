export default (response) => {
    var parser = new DOMParser();
    var doc = parser.parseFromString(response.data, "application/xml");

    const channel = doc.getElementsByTagName('channel');
    const children = channel[0].childNodes;
    
    const title = Array.from(children).find((element, index, array) => element.nodeName === 'title').innerHTML;

    const items = Array.from(children).filter(el => el.nodeName === 'item').
        map(el => el.childNodes);
    const item = items.map(el => Array.prototype.slice.call(el)).
        map(item => {
            const link =  item.find((element, index, array) => {
                return element.nodeName === 'link';
            })
            const text = item.find((element, index, array) => {
                return element.nodeName === 'title';
            })
            return {link: link.innerHTML, text: text.innerHTML}
        });
    return {news :item, title: title}
}