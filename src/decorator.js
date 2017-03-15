import React from 'react';
import { createTypeStrategy } from "megadraft";
import { Emoji } from 'emoji-mart'
import { CompositeDecorator, Modifier, EditorState } from 'draft-js';
import findWithRegex from 'find-with-regex';
import { emojiIndex } from 'emoji-mart'
import constants from './constants';

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

const co = (props, what) => {
  console.log(props, what);
  const text = props.decoratedText.slice(2);
  if (text.length > 2) {
    const suggests = emojiIndex.search(text);
    console.log(suggests);
    if (suggests) {
      suggests.map((o) => { console.log(o) });
      const emoji = suggests[0];
      const editorState = props.getEditorState();
      const contentState = props.contentState;
      const contentStateWithEntity = contentState.createEntity(
        constants.EMOJI_ENTITY_TYPE,
        'IMMUTABLE',
        { emoji },
      );
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const selection = contentState.getSelectionAfter();
      const entitySelection = selection.set(
        'anchorOffset', selection.getFocusOffset() - (text.length + 1)
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
      setImmediate(() => props.onChange(nextEditorState));
    }
  }
  return (
    <span>{props.children}</span>
  )
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
