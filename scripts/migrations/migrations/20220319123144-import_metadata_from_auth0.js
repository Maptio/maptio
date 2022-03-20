const e = require('express');
const { create } = require('lodash');

let auth0Export = require('/Users/romek/Spaces/Projects/Maptio/Code/maptio/scripts/migrations/migrations/20220319-auth0_export.json');

module.exports = {
  async up(db, client) {
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script

    let cursor = db.collection('users').find();
    for await (let user of cursor) {
      console.log(`Migrating data for user with email: ${user.email} and auth0 id: ${user.user_id}`);
      console.log('User data in MongoDB:', user);
      console.log();

      const auth0User = auth0Export.find(auth0User => auth0User.Id === user.user_id);
      console.log('User data in Auth0:', auth0User);
      console.log();

      const isInAuth0 = auth0User !== undefined;

      let isActivationPending;
      let isInvitationSent;
      let userRoleString;

      if (!isInAuth0) {
        console.log('WARNING: User not found in auth0 export');

        // Try sane defaults if user is not in Auth0
        isActivationPending = true;
        isInvitationSent = false;
        userRoleString = 'Standard';
      } else {
        // Read the important information from the Auth0 export
        isActivationPending = auth0User.isActivationPending;
        isInvitationSent = auth0User.isInvitationSent;
        userRoleString = auth0User.userRole;
      }

      let userRole;
      switch(userRoleString) {
        case 'Admin':
          userRole = 1;
          break;
        case 'Superuser':
          userRole = 2;
          break;
        case 'Standard':
          userRole = 0;
          break;
        default:
          console.log('WARNING: Unknown user role:', userRoleString);
      }

      console.log('Setting the following properties:');
      console.log('isInAuth0', userRole);
      console.log('isActivationPending', isActivationPending);
      console.log('isInvitationSent', isInvitationSent);
      console.log('userRole', userRole);
      console.log();

      const updateResult = await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: {
            isInAuth0,
            isActivationPending,
            isInvitationSent,
            userRole,
          }
        }
      );

      console.log('Result of MongoDB update', updateResult);
      console.log();

      const userAfterUpdate = await db.collection('users').find(
        { _id: user._id }
      ).toArray();
      console.log('User data after update:', userAfterUpdate);

      console.log('\n\n\n');
    }
  },

  // Rolling back the above migration (if possible)
  async down(db, client) {
    // Sadly not possible in this case...
  }
};
