import { EditorState, Modifier } from 'draft-js';
import constants from "./constants";

const editorStateWithEmoji = (editorState, emoji) => {
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

  return EditorState.push(editorState, contentStateWithEmoji, "insert-characters");
};

export default editorStateWithEmoji;