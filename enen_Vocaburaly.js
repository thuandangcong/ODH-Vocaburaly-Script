/* global api */
class enen_Vocabulary{
    constructor(options) {
        this.options = options;
        this.maxexample = 2;
        this.word = '';
    }

    async displayName() {
        return 'Vocabulary EN->EN Dictionary';
    }


    setOptions(options) {
        this.options = options;
        this.maxexample = options.maxexample;
    }

    async findTerm(word) {
        this.word = word;
        let list = [word]
        let promises = list.map((item) => this.findCollins(item));
        let results = await Promise.all(promises);
        return [].concat(...results).filter(x => x);
    }

    async findCollins(word) {
        const maxexample = this.maxexample;
        let notes = [];

        if (!word) return notes;
        let expression = word;

        let audios = [];
        audios[0] = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(expression)}&type=2`;
        audios[1] = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(expression)}&type=1`;

        const base = 'https://www.vocabulary.com/dictionary/';
        const url = base + encodeURIComponent(word);
        let doc = '';
        try {
            let data = await api.fetch(url);
            let parser = new DOMParser();
            doc = parser.parseFromString(data, "text/html");
        } catch (err) {
            return null;
        }
        
        let ipa = doc.querySelectorAll('.ipa-section > div > span > h3') || '';
        let reading = 'no ipa'; 
        if (ipa.length > 0) {
            reading = ''
            // for (const i of ipa) {
            //     reading += i.innerText;
            // }
            reading += ipa[0].innerText;
        }


        let extrainfo = '';
        let pos = doc.querySelector('div.pos-icon').innerText || '';
        pos = pos ? `<span class="pos">${pos}</span>` : '';

        let desc_short = doc.querySelector('p.short') || '';
        // let desc_long = doc.querySelector('p.long') || '';
        desc_short = desc_short ? `<span class="eng_sent">${desc_short.innerText}</span>` : '';
        // desc_long = desc_long ? `<span class="eng_sent desc_long">${desc_long.innerText}</span>` : '';
        // let definition = `${pos}<span class="tran">${desc_short}<br>${desc_long}</span>`;
        let definition = `${pos}<span class="tran">${desc_short}</span>`;
 
        let definitions = [definition];
        const contents = doc.querySelectorAll('div.word-definitions > ol > li') || [];
        for (const content of contents) {
            let innerText = content.children[0].innerText;
            innerText = innerText.trim();

            let words = innerText.split(' ');
            let pos = words[0];
            let tran = words.slice(1).join(' ');
            
            pos = pos ? `<span class="pos">${pos}</span>` : '';
            tran = tran ? `<span class="eng_tran">${tran}</span>` : '';
            let definition = `${pos}<span class="tran">${tran}</span>`;
            
            //example
            let examples =content.querySelectorAll('.example') || [];
            if (examples.length > 0) {
                definition += '<ul class="sents">';
                for (const ex of examples) {
                    let eng_sent = ex.innerText;
                    definition += `<li class='sent'><span class='eng_sent'>${eng_sent}</span></li>`;
                }
                definition += '</ul>';
            }

            definitions.push(definition);
        }
        // definitions.push(definition);
        
        let css = this.renderCSS();
        notes.push({
            css,
            expression,
            reading,
            extrainfo,
            definitions,
            audios
        });

        return notes;
    }

    renderCSS() {
        let css = `
            <style>
                span.star {color: #FFBB00;}
                span.cet  {margin: 0 3px;padding: 0 3px;font-weight: normal;font-size: 0.8em;color: white;background-color: #5cb85c;border-radius: 3px;}
                span.pos  {text-transform:lowercase; font-size:0.9em; margin-right:5px; padding:2px 4px; color:white; background-color:#0d47a1; border-radius:3px;}
                span.tran {margin:0; padding:0;}
                span.eng_tran {margin-right:3px; padding:0;}
                span.chn_tran {color:#0d47a1;}
                ul.sents {font-size:0.8em; list-style:square inside; margin:3px 0;padding:5px;background:rgba(13,71,161,0.1); border-radius:5px;}
                li.sent  {margin:0; padding:0;}
                span.eng_sent {margin-right:5px;}
                span.chn_sent {color:#0d47a1;}
                span.desc_long {font-size:0.9em; color:#231f1ffc; font-style:italic;}
            </style>`;
        return css;
    }
}