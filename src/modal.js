import React from 'react';
import { CompositeDecorator, Modifier, EditorState, getVisibleSelectionRect } from 'draft-js';
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

    componentDidMount() {
      document.addEventListener('keydown', this.handleKeyDown, true);
    }
    componentWillUnmount() {
      document.removeEventListener('keydown', this.handleKeyDown, true);
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
      const searchString = textToReplace.slice(startToken.length);
      if (searchString.length <= minLength) {
        console.log('nolength');
        //return;
      }
      /*
       const firstWhitespaceOffset = text.lastIndexOf(' ', offset);
       if (firstTokenOffset > firstWhitespaceOffset) {

       }
       */
      const suggests = search(searchString);
      if (!suggests || suggests.length === 0) {
        console.log('nosuggest');
        return;
      }
      const selRect = getVisibleSelectionRect(window);
      if (!selRect) {
        return;
      }
      const top = selRect.bottom;
      const left = selRect.left - searchString.length - startToken.length;
      this.setState({
        showModal: true,
        suggests,
        idx: 0,
        style: {
          position: 'absolute',
          top,
          left,
          width: '300px',
          listStyleType: 'none',
          border: '1px black solid',
          zIndex: 10000,
          background: 'white',
          padding: 0,
        },
        textToReplace,
      });
    }

    handleKeyDown = (event) => {
      if (!this.state.showModal) {
        return;
      }
      switch(event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          if (this.state.idx === this.state.suggests.length) {
            this.setState({
              idx: 1,
            });
            return;
          }
          this.setState({
            idx: this.state.idx + 1,
          });
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          if (this.state.idx === 1) {
            this.setState({
              idx: this.state.suggests.length,
            });
            return;
          }
          this.setState({
            idx: this.state.idx - 1,
          });
          break;
        }
        case 'Enter': {
          const currentSuggest = this.state.suggests[this.state.idx - 1];
          if (currentSuggest) {
            event.preventDefault();
            event.stopPropagation();
            this.insertEmoji(currentSuggest);
          }
          break;
        }
        case 'Escape': {
          this.setState({
            showModal: false,
          });
          break;
        }
      }

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
          {this.state.suggests && this.state.suggests.map((o, idx) => (
            <li
              key={o.id}
              onClick={() => this.onClick(o)}
              style={{
                backgroundColor: this.state.idx === idx + 1 ? 'grey' : 'white',
              }}
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
