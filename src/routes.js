import Knex from './knex';
import jwt from 'jsonwebtoken';
import GUID from 'node-uuid';

const routes = [

    {

        path: '/birds',
        method: 'GET',
        handler: ( request, reply ) => {

            const getOperation = Knex( 'birds' ).where( {

                isPublic: true

            } ).select( 'name', 'species', 'picture_url' ).then( ( results ) => {

                if( !results || results.length === 0 ) {

                    reply( {

                        error: true,
                        errMessage: 'no public bird found',

                    } );

                }

                reply( {

                    dataCount: results.length,
                    data: results,

                } );

            } ).catch( ( err ) => {

                reply( 'server-side error' );

            } );

        }

    },

    {

        path: '/auth',
        method: 'POST',
        handler: ( request, reply ) => {

            const { username, password } = request.payload;

            const getOperation = Knex( 'users' ).where( {

                username,

            } ).select( 'password', 'guid' ).then( ( [ user ] ) => {

                if( !user ) {

                    reply( {

                        error: true,
                        errMessage: 'the specified user was not found',

                    } );

                    return;

                }

                if( user.password === password ) {

                    const token = jwt.sign( {

                        username,
                        scope: user.guid,

                    }, 'vZiYpmTzqXMp8PpYXKwqc9ShQ1UhyAfy', {

                        algorithm: 'HS256',
                        expiresIn: '1h',

                    } );

                    reply( {

                        token,
                        scope: user.guid,

                    } );

                } else {

                    reply( 'incorrect password' );

                }

            } ).catch( ( err ) => {

                reply( 'server-side error' );

            } );

        }

    },

    {

        path: '/birds',
        method: 'POST',
        config: {

            auth: {

                strategy: 'token',

            }

        },
        handler: ( request, reply ) => {

            const { bird } = request.payload;

            const guid = GUID.v4();

            const insertOperation = Knex( 'birds' ).insert( {

                owner: request.auth.credentials.scope,
                name: bird.name,
                species: bird.species,
                picture_url: bird.picture_url,
                guid,

            } ).then( ( res ) => {

                reply( {

                    data: guid,
                    message: 'successfully created bird'

                } );

            } ).catch( ( err ) => {

                reply( 'server-side error' );

            } );

        }

    },

    {

        path: '/birds/{birdGuid}',
        method: 'PUT',
        config: {

            auth: {

                strategy: 'token',

            },

            pre: [

                {

                    method: ( request, reply ) => {

                        const { birdGuid } = request.params
                            , { scope }    = request.auth.credentials;

                        const getOperation = Knex( 'birds' ).where( {

                            guid: birdGuid,

                        } ).select( 'owner' ).then( ( [ result ] ) => {

                            if( !result ) {

                                reply( {

                                    error: true,
                                    errMessage: `the bird with id ${ birdGuid } was not found`

                                } ).takeover();

                            }

                            if( result.owner !== scope ) {

                                reply( {

                                    error: true,
                                    errMessage: `the bird with id ${ birdGuid } is not in the current scope`

                                } ).takeover();

                            }

                            return reply.continue();

                        } );

                    }

                }

            ],

        },
        handler: ( request, reply ) => {

            const { birdGuid } = request.params
                , { bird }     = request.payload;

            const insertOperation = Knex( 'birds' ).where( {

                guid: birdGuid,

            } ).update( {

                name: bird.name,
                species: bird.species,
                picture_url: bird.picture_url,
                isPublic: bird.isPublic,

            } ).then( ( res ) => {

                reply( {

                    message: 'successfully updated bird'

                } );

            } ).catch( ( err ) => {

                reply( 'server-side error' );

            } );

        }

    }

];

export default routes;
