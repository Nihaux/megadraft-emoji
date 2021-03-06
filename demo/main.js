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
import { emojiIndex } from 'emoji-mart'

import plugin from "../src/plugin";
import { withTypeahead, replaceText } from 'hodc-typeahead';
import constants from '../src/constants';

import INITIAL_CONTENT from "./content";

const insertEmoji = (emoji, editorState, textToReplace) => {
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity(
    constants.EMOJI_ENTITY_TYPE,
    'IMMUTABLE',
    { emoji },
  );
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  return replaceText(emoji.native, editorState, textToReplace, entityKey);
};

const MyEditor =
withTypeahead({
  startToken: " :",
  search: (text) =>  emojiIndex.search(text, () => true, 10),
  renderSuggest: (o) => <span>{o.native} {o.id}</span>,
  onClick: insertEmoji,
  breakOnWhitespace: true,
})(MegadraftEditor);

class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: editorStateFromRaw(INITIAL_CONTENT),
    };
  }

  onChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  render = () => {
    const pluginName = "emoji";
    return (
        <div className="content">
          <header>
            <h1>{pluginName} - Megadraft Plugin</h1>
          </header>

          <div className="editor">
            <MyEditor
              editorState={this.state.editorState}
              onChange={this.onChange}
              plugins={[plugin]}
            />
          </div>
        </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById("container"));
