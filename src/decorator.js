import React from 'react';
import { createTypeStrategy } from "megadraft";
import { Emoji } from 'emoji-mart'
import { CompositeDecorator, Modifier, EditorState } from 'draft-js';
import { emojiIndex } from 'emoji-mart'
import constants from './constants';

const EmojiEntity = ({entityKey, contentState}) => {
  const { emoji: { id, native } } = contentState.getEntity(entityKey).getData();
  return (
    <Emoji emoji={id} size={24} native />
  );
};

const EMOJI_REGEX = /(\s|^):[\w]*/g;


export default () => {
  return new CompositeDecorator([
    {
      strategy: createTypeStrategy(constants.EMOJI_ENTITY_TYPE),
      component: EmojiEntity,
    },
  ]);
}
