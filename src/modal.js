import React from 'react';
import { CompositeDecorator, Modifier, EditorState } from 'draft-js';
import { emojiIndex, Emoji } from 'emoji-mart'
import constants from './constants';

class MyMod extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      showModal: false,
    });

    const sel = nextProps.editorState.getSelection();
    if (!sel.isCollapsed()) {
      return;
    }
    const startKey = sel.getStartKey();
    const currentContent = nextProps.editorState.getCurrentContent();
    const block = currentContent.getBlockForKey(startKey);

    if (!block.text) {
      return;
    }

    const selOffset = sel.getStartOffset();
    const text = block.getText();
    const firstTokenOffset = text.lastIndexOf(nextProps.token, selOffset);
    if (firstTokenOffset === -1) {
      return;
    }
    const searchString = text.slice(firstTokenOffset + 1, selOffset);
    if (searchString.length <= 2) {
      return;
    }
    /*
    const firstWhitespaceOffset = text.lastIndexOf(' ', offset);
    if (firstTokenOffset > firstWhitespaceOffset) {

    }
    */
    const suggests = emojiIndex.search(searchString, () => true, 10);
    console.log(suggests);
    if (!suggests || suggests.length === 0) {
      return;
    }

    const tempRange = window.getSelection().getRangeAt(0).cloneRange();
    console.log(tempRange, currentContent.getSelectionAfter());
    tempRange.setStart(tempRange.startContainer, currentContent.getSelectionAfter().focusOffset - searchString.length - 1);

    const rangeRect = tempRange.getBoundingClientRect();
    let [left, top] = [rangeRect.left, rangeRect.bottom];
    this.setState({
      showModal: true,
      suggests,
      style: {
        position: 'absolute',
        top,
        left,
        width: '300px',
        listStyleType: 'none',
        border: '1px black solid',
      },
    });
  }

  insertEmoji = (emoji) => {
    const editorState = this.props.editorState;
    const contentState = this.props.editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      constants.EMOJI_ENTITY_TYPE,
      'IMMUTABLE',
      {emoji},
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const selection = contentState.getSelectionAfter();
    const entitySelection = selection.set(
      'anchorOffset', selection.getFocusOffset() - (this.props.decoratedText.length - 1)
    );
    const contentStateWithEmoji = Modifier.replaceText(
      contentStateWithEntity,
      entitySelection,
      emoji.native,
      null,
      entityKey,
    );
    const finalContentState = Modifier.insertText(
      contentStateWithEmoji,
      contentStateWithEmoji.getSelectionAfter(),
      ' ',
      null,
      null,
    );
    const nextEditorState = EditorState.push(
      editorState, finalContentState, 'insert-characters'
    );
    setImmediate(() => this.props.onChange(nextEditorState));
    this.closeModal();
  };

  closeModal = () => {
    console.log('close');
    this.setState({
      showModal: false,
    });
  };

  render = () =>
      this.state.showModal &&
        <ul style={this.state.style}>
          {this.state.suggests.map((o) => (
            <li
              key={o.id}
              onClick={() =>this.insertEmoji(o)}
            >
              <Emoji emoji={o.id} size={16} /> {o.id}
            </li>
          ))}
        </ul>
};

export default MyMod;
