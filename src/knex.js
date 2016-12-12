export default require( 'knex' )( {

    client: 'mysql',
    connection: {

        host: '192.168.33.10',

        user: 'birdbase',
        password: 'password',

        database: 'birdbase',
        charset: 'utf8',

    }

} );
