/*
 * Copyright (c) 2017, Nicolas Hauseux <nicolas.hauseux@gmail.com>
 *
 * License: MIT
 */

import React, {Component} from "react";
import { EditorState, convertToRaw, Modifier } from 'draft-js';
import Icon from "./icon.js";
import constants from "./constants";
import {insertDataBlock} from "megadraft";
import { Picker } from 'emoji-mart'
import Modal from 'react-modal';
import 'emoji-mart/css/emoji-mart.css';

const customStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.75)'
  },
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
  }
};

export default class Button extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPicker: false,
    };
  }

  openModal = () => {
    this.setState({
      showPicker: true,
    });
  };

  closeModal = () => {
    this.setState({
      showPicker: false,
    });
  };

  insertEmoji = (emoji) => {
    console.log(emoji);
    const editorState = this.props.editorState;
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      constants.EMOJI_ENTITY_TYPE,
      'IMMUTABLE',
      { emoji: emoji },
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const selectionState = editorState.getSelection();
    const afterRemoval = Modifier.removeRange(contentStateWithEntity, selectionState, 'backward');
    const targetSelection = afterRemoval.getSelectionAfter();
    const contentStateWithEmoji = Modifier.insertText(
      contentStateWithEntity,
      targetSelection,
      emoji.native,
      null,
      entityKey,
    );
    this.props.onChange(EditorState.push(editorState, contentStateWithEmoji, "insert-characters"));
    this.closeModal();
  };

  render() {
    return (
      <div>
        <button className={this.props.className} type="button" onClick={this.openModal}>
          <Icon className="sidemenu__button__icon" />
        </button>
        <Modal
          isOpen={this.state.showPicker}
          onRequestClose={this.closeModal}
          contentLabel="Pick-your-emoji"
          style={customStyles}
        >
          <Picker set='emojione' onClick={this.insertEmoji}/>
        </Modal>
      </div>
    );
  }
}
