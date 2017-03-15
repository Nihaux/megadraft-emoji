import React from 'react';
import { createTypeStrategy } from "megadraft";
import { Emoji } from 'emoji-mart'
import { CompositeDecorator, Modifier, EditorState } from 'draft-js';
import findWithRegex from 'find-with-regex';
import { emojiIndex } from 'emoji-mart'
import constants from './constants';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Modal from 'react-modal';

const EmojiEntity = ({entityKey, contentState}) => {
  const { emoji: { id } } = contentState.getEntity(entityKey).getData();
  return (
    <Emoji emoji={id} size={24}/>
  );
};

const EMOJI_REGEX = /(\s|^):[\w]*/g;
const emojiSuggestion = (contentBlock, callback) => {
  findWithRegex(EMOJI_REGEX, contentBlock, callback);
};

class co extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
    };
  }

  componentDidMount() {
    this.search(this.props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('should',nextProps);
    return nextProps.decoratedText !== this.props.decoratedText
      || nextState.showModal !== this.state.showModal;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.decoratedText !== this.props.decoratedText) {
      this.search(nextProps);
    }
  }

  search = (props) => {
    const text = props.decoratedText.slice(2);
    if (text.length > 2) {
      const suggests = emojiIndex.search(text, () => true, 10);
      if (suggests && suggests.length > 0) {
        const tempRange = window.getSelection().getRangeAt(0).cloneRange();
        tempRange.setStart(tempRange.startContainer, props.contentState.getSelectionAfter().start);

        const rangeRect = tempRange.getBoundingClientRect();
        let [left, top] = [rangeRect.left, rangeRect.bottom];
        this.setState({
          showModal: true,
          suggests,
          style: {
            content : {
              top,
              left,
              width: '300px',
            },
            overlay : {
              position          : 'fixed',
              top               : 0,
              left              : 0,
              right             : 0,
              bottom            : 0,
              backgroundColor   : 'rgba(255, 255, 255, 0.75)'
            },
          },
        });
      }
    }
  };

  insertEmoji = (emoji) => {
    const editorState = this.props.getEditorState();
    const contentState = this.props.contentState;
    const contentStateWithEntity = contentState.createEntity(
      constants.EMOJI_ENTITY_TYPE,
      'IMMUTABLE',
      {emoji},
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const selection = contentState.getSelectionAfter();
    const entitySelection = selection.set(
      'anchorOffset', selection.getFocusOffset() - (this.props.decoratedText.length + 1)
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

  render = () => {
    if (!this.state.showModal) {
      return (
        <span>{this.props.children}</span>
      )
    }

    return (
      <MuiThemeProvider>
        <span>
          {this.props.decoratedText}
          <Modal
            isOpen={this.state.showModal}
            onRequestClose={this.closeModal}
            contentLabel="Pick-your-emoji"
            style={this.state.style}
          >
          <Menu>
            {this.state.suggests.map((o) => (
              <MenuItem
                key={o.id}
                onClick={() =>this.insertEmoji(o)}
              >
                <Emoji emoji={o.id} size={16} /> {o.id}
              </MenuItem>
            ))}
          </Menu>
        </Modal>
        </span>
      </MuiThemeProvider>
    );
  }
};

export default (config) => {
  return new CompositeDecorator([
    {
      strategy: createTypeStrategy(constants.EMOJI_ENTITY_TYPE),
      component: EmojiEntity,
    },
    {
      strategy: emojiSuggestion,
      component: co,
      props: {
        getEditorState: config.getEditorState,
        onChange: config.onChange,
      },
    }
  ]);
}
