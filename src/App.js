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
            fold: [ "opener-control" ],
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
                        { !this.state.error ? null :
                            <div className="notification is-danger"> { this.state.error.message } </div>
                        }
                        <div className="field">
                            <label className="label">Website url</label>
                            <div className="control">
                                <input type="text" className="input" onBlur={ e => this.loadWebsite(e) } />
                            </div>
                        </div>
                    </div>
                    <div className="container">
                        <div id="fakeIFrame"
                            style={{ position: "relative", border: "1px solid #444", height: "200px", overflow: "scroll", margin: "20px 0px" }}
                            dangerouslySetInnerHTML={{ __html: this.state.websiteMarkup }}></div>
                        { !this.state.model ? null :<TreeView { ...this.state } /> }
                    </div>
                </section>
            </div>
        )
    }

    loadWebsite(e) {
        wretch(e.currentTarget.value)
            .get()
            .text(markup => {
                this.setState({ error: null, websiteMarkup: sanitizeHtml(markup, { allowedTags: false, allowedAttributes: { "*": ["id", "class"] }}) }, () => {
                    const model = document.getElementById("fakeIFrame")
                    const recurse = m => {
                        if(m.children.length > 0) {
                            m.__children = Array.from(m.children)
                            m.__children.forEach(recurse)
                        }
                    }
                    recurse(model)
                    this.setState({ model: [{ tagName: "HTML", __children: model.__children }] || [] })
                })
            })
            .catch(err => {
                console.error(err)
                this.setState({ error: err })
            })

    }
}

export default App
