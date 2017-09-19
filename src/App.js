import React, { Component } from "react"
import "./App.css"

import { TreeView } from "bosket/react"
import { array } from "bosket/tools"
import wretch from "wretch"
import sanitizeHtml from "sanitize-html"

class App extends Component {

    state = {
        category: "__children",
        selection: [],
        onSelect: _ => this.setState({ selection: _ }),
        model: null,
        display: _ => _.tagName +
            (_.id ? " #" + _.id : "") +
            ((_.className && _.className.split) ? " ." + _.className.split(" ").join(".") : ""),
        strategies: {
            fold: [ function(item) {
                return array(this.state.get().unfolded).contains(item)
            } ],
            click: [ "toggle-fold" ]
        },
        labels: {
            "search.placeholder": "Search ... (start with a . for class match, with a # for id match)"
        },
        search: input => item =>
            input.startsWith(".") ? item.className && item.className.toLowerCase && ~(item.className.toLowerCase().indexOf(input.toLowerCase().substring(1))) :
            input.startsWith("#") ? item.id && item.id.toLowerCase().startsWith(input.toLowerCase().substring(1)) :
            item.tagName.toLowerCase().startsWith(input.toLowerCase())
    }

    render() {
        return (
            <div>
                <section className="hero is-dark">
                    <div className="hero-body">
                        <div className="container">
                            <h1 className="title">Html Tree</h1>
                            <h2 className="subtitle">
                                Render the html tree of any website.
                            </h2>
                        </div>
                    </div>
                </section>
                <section className="section">
                    <div className="container">
                    <div className="notification is-warning">You may need a <a href="https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi" target="_blank">plugin</a> to circumvent the CORS policy.</div>
                        { !this.state.error ? null :
                            <div className="notification is-danger"> { this.state.error.toString() } </div>
                        }
                        <div className="field">
                            <label className="label">Website url</label>
                            <div className="control">
                                <input type="text" className="input" onBlur={ e => this.loadWebsite(e) } />
                            </div>
                            <p className="help">Enter the url then focus out</p>
                        </div>
                        <div className="field">
                            <label className="label">HTML code</label>
                            <div className="control">
                                <textarea className="textarea" placeholder="Enter some HTML code ..."
                                    value={ this.state.websiteMarkup }
                                    onChange={ e => this.setState({ websiteMarkup: e.currentTarget.value })}
                                    onBlur={ e => this.loadCode(e) }>
                                </textarea>
                            </div>
                            <p className="help">Paste HTML then focus out</p>
                        </div>
                        <div className="field">
                            <label className="label">Preview</label>
                            <div className="control">
                                <div id="fakeIFrame"
                                    style={{ position: "relative", border: "1px solid #444", height: "200px", overflow: "scroll", margin: "20px 0px" }}
                                    dangerouslySetInnerHTML={{ __html: this.state.websiteMarkup }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="container">
                        { !this.state.model ? null :<TreeView { ...this.state } /> }
                    </div>
                </section>
            </div>
        )
    }

    updateModel() {
        const parser = new DOMParser().parseFromString(this.state.websiteMarkup, "text/html")
        const model = parser.documentElement
        formatHTML(model)
        this.setState({ model: [{ tagName: "HTML", __children: model.__children }] || [] })
    }

    loadWebsite(e) {
        wretch(e.currentTarget.value, { mode: "cors" })
            .get()
            .text(markup => {
                this.setState({ error: null, websiteMarkup: sanitize(markup) }, this.updateModel)
            })
            .catch(err => {
                console.error(err)
                this.setState({ error: err })
            })

    }

    loadCode(e) {
        if(!e.currentTarget.value)
            return
        this.setState({ error: null, websiteMarkup: sanitize(e.currentTarget.value) }, this.updateModel)
    }
}

const sanitize = markup => sanitizeHtml(markup, { allowedTags: false, allowedAttributes: { "*": ["id", "class"] }})
const formatHTML = elt => {
    if(elt.children.length > 0) {
        elt.__children = Array.from(elt.children)
        elt.__children.forEach(formatHTML)
    }
}

export default App
