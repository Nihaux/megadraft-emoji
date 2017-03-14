/*
 * Copyright (c) 2017, Nicolas Hauseux <nicolas.hauseux@gmail.com>
 *
 * License: MIT
 */

import React from "react";
import ReactDOM from "react-dom";
import { MegadraftEditor } from "megadraft";
import {editorStateFromRaw} from "megadraft/lib/utils";

import plugin from "../src/plugin";

import INITIAL_CONTENT from "./content";


class Demo extends React.Component {
  constructor(props) {
    console.log('demo');
    super(props);
    this.state = {
      content: editorStateFromRaw(INITIAL_CONTENT)
    };
    this.onChange = ::this.onChange;
  }

  onChange(content) {
    this.setState({content});
  }

  render() {
    const pluginName = "emoji";
    return (
        <div className="content">
          <header>
            <h1>{pluginName} - Megadraft Plugin</h1>
          </header>

          <div className="editor">
            <MegadraftEditor plugins={[plugin]} editorState={this.state.content} onChange={this.onChange} />
          </div>
        </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById("container"));
