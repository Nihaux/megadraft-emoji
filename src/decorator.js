import React from 'react';
import { createTypeStrategy } from "megadraft";
import { Emoji } from 'emoji-mart'
import { CompositeDecorator } from 'draft-js';
import constants from './constants';

const EmojiEntity = ({entityKey, contentState}) => {
  const { emoji: { id } } = contentState.getEntity(entityKey).getData();
  return (
    <Emoji emoji={id} size={24}/>
  );
};

export default new CompositeDecorator([
  {
    strategy: createTypeStrategy(constants.EMOJI_ENTITY_TYPE),
    component: EmojiEntity,
  },
]);
