import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  canDeleteContent,
  canEditContent,
  CONTENT_MODERATOR_ROLES,
} from '../src/lib/authorization';

test('authors can delete their own announcements and comments', () => {
  assert.equal(canDeleteContent({ id: 'author', roles: [] }, 'author'), true);
});

test('members cannot delete content they did not create, whatever their staff role', () => {
  assert.equal(canDeleteContent({ id: 'member', roles: [] }, 'author'), false);
  assert.equal(
    canDeleteContent(
      {
        id: 'staff',
        roles: ['ring1', 'akademik', 'cnc', 'curhatadmin', 'peoplemanage'],
      },
      'author',
    ),
    false,
  );
});

test('moderators can delete anyone’s content', () => {
  for (const role of CONTENT_MODERATOR_ROLES) {
    assert.equal(
      canDeleteContent({ id: 'moderator', roles: [role] }, 'author'),
      true,
    );
  }
});

test('only the author can edit content, moderators included', () => {
  assert.equal(canEditContent({ id: 'author' }, 'author'), true);
  assert.equal(canEditContent({ id: 'member' }, 'author'), false);
  assert.equal(canEditContent({ id: 'moderator' }, 'author'), false);
});
