import Hapi from 'hapi';
import routes from './routes';

const server = new Hapi.Server();

server.connection( {
    port: 8080
} );

server.register( require( 'hapi-auth-jwt' ), ( err ) => {

    if( !err ) {
        console.log( 'done' );
    }

    server.auth.strategy( 'token', 'jwt', {

        key: 'vZiYpmTzqXMp8PpYXKwqc9ShQ1UhyAfy',

        verifyOptions: {
            algorithms: [ 'HS256' ]
        }

    } );

    routes.forEach( ( route ) => {

        console.log( `attaching ${ route.path }` );
        server.route( route );

    } );

} );


server.start( err => {

    if( err ) {

        // Fancy error handling here
        console.error( 'Error was handled!' );
        console.error( err );

    }

    console.log( `Server started at ${ server.info.uri }` );

} );
