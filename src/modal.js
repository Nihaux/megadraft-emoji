import React from 'react';
import { CompositeDecorator, Modifier, EditorState } from 'draft-js';
import { emojiIndex, Emoji } from 'emoji-mart'
import constants from './constants';

const withTypeahead = ({ startToken, search, renderSuggest, minLength = 2 }) => (Editor) => {
  return class TypeaheadEditor extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        showModal: false,
      };
    }

    componentWillReceiveProps(nextProps) {
      const sel = nextProps.editorState.getSelection();
      if (!sel.isCollapsed() || !sel.hasFocus) {
        return;
      }

      this.setState({
        showModal: false,
      });
      const startKey = sel.getStartKey();
      const currentContent = nextProps.editorState.getCurrentContent();
      const block = currentContent.getBlockForKey(startKey);

      if (!block.text) {
        console.log('notext');
        return;
      }

      const selOffset = sel.getStartOffset();
      const text = block.getText();
      const firstTokenOffset = text.lastIndexOf(startToken, selOffset);
      if (firstTokenOffset === -1) {
        console.log('nostartToken');
        return;
      }
      const textToReplace = text.slice(firstTokenOffset, selOffset);
      const searchString = textToReplace.slice(1);
      if (searchString.length <= minLength) {
        console.log('nolength');
        //return;
      }
      /*
       const firstWhitespaceOffset = text.lastIndexOf(' ', offset);
       if (firstTokenOffset > firstWhitespaceOffset) {

       }
       */
      console.log(searchString);
      const suggests = search(searchString);
      console.log(suggests);
      if (!suggests || suggests.length === 0) {
        console.log('nosuggest');
        return;
      }
      setImmediate(() => {
        const tmpRange = window.getSelection().getRangeAt(0).cloneRange();
        tmpRange.setStart(
          tmpRange.startContainer,
          sel.focusOffset - searchString.length - 1
        );

        const rangeRect = tmpRange.getBoundingClientRect();
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
            zIndex: 10000,
            background: 'white',
          },
          textToReplace,
        });
      })
    }
    onClick = (emoji) => {
      this.setState({
        showModal: false,
      });
      this.insertEmoji(emoji);
    };

    insertEmoji = (emoji) => {
      console.log(emoji);
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
        'anchorOffset', selection.getFocusOffset() - this.state.textToReplace.length
      );
      const contentStateWithEmoji = Modifier.replaceText(
        contentState,
        entitySelection,
        emoji.native,
        null,
        entityKey,
      );
      const finalContentState = Modifier.insertText(
        contentStateWithEmoji,
        contentStateWithEmoji.getSelectionAfter(),
        ' ',
      );
      const nextEditorState = EditorState.push(
        editorState, finalContentState, 'insert-characters'
      );
      this.props.onChange(nextEditorState);
    };

    render = () => (
      <div>
        <ul
          style={
            Object.assign({
                display: this.state.showModal ? 'block' : 'none',
              },
              this.state.style
            )
          }
        >
          {this.state.suggests && this.state.suggests.map((o) => (
            <li
              key={o.id}
              onClick={() => this.onClick(o)}
            >
              {renderSuggest(o)}
            </li>
          ))}
        </ul>
        <Editor {...this.props} />
      </div>
    );
  };

};

export default withTypeahead;
