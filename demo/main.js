/*
 * Copyright (c) 2017, Nicolas Hauseux <nicolas.hauseux@gmail.com>
 *
 * License: MIT
 */

import React from "react";
import ReactDOM from "react-dom";
import { MegadraftEditor } from "megadraft";
import { convertToRaw } from 'draft-js';
import {editorStateFromRaw} from "megadraft/lib/utils";
import { emojiIndex, Emoji } from 'emoji-mart'

import plugin from "../src/plugin";
import MyMod from '../src/modal';

import INITIAL_CONTENT from "./content";

class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: editorStateFromRaw(INITIAL_CONTENT),
    };
  }

  getEditor = () => this.editor;

  onChange = (editorState) => {
    this.setState({
      editorState,
    });
    console.log(convertToRaw(editorState.getCurrentContent()));
  };

  getEditorState = () => this.state.editorState;

  render = () => {
    const pluginName = "emoji";
    return (
        <div className="content">
          <header>
            <h1>{pluginName} - Megadraft Plugin</h1>
          </header>

          <div className="editor">
            <MyMod
              editorState={this.state.editorState}
              onChange={this.onChange}
              token=":"
              search={(text) =>  emojiIndex.search(text, () => true, 10)}
              renderSuggest={(o) => <span>{o.native} {o.id}</span>}
            />
            <MegadraftEditor plugins={[plugin]} editorState={this.state.editorState} onChange={this.onChange} />
          </div>
        </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById("container"));
