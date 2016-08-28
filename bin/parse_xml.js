#!/usr/bin/env node

// Parse Posts.xml from a Stack Exchange site archive, extracting the information we need

var _ = require( 'lodash' );
var fs = require( 'fs' );
var htmlToText = require( 'html-to-text' );
var url_parse = require( 'url' ).parse;
var xmlFlow = require( 'xml-flow' );

// Read in from a supplied file name
var xmlStream = xmlFlow( fs.createReadStream( process.argv[2] ), { simplifyNodes: false } );
var results = '';

xmlStream.on( 'tag:row', function( node )
{
	var data = node.$attrs;
	if ( !data.body && node.$cdata )
	{
		data.body = node.$cdata;
	}

	// Filter out tag wikis
	var type = +data.posttypeid;
	if ( type === 1 || type === 2 )
	{
		results += ',' + JSON.stringify( extract_post_data( data ) );
	}
});

xmlStream.on( 'end', function()
{
	process.stdout.write( '[' + results.slice( 1 ) + ']' );
});

function extract_post_data( data )
{
	var translations = {};
	var body = data.body
		// Replace fancy dashes and hyphens with normal ones
		.replace( /[\u2010-\u2015]/g, '-' );

	// Strip the formatting
	body = htmlToText.fromString( body, {
		wordwrap: false,
	})
		// And extract translations
		.replace( /\[(\w+:\/\/[^\]]+)\] ?/g, _.curry( extract_translations )( translations ) );

	var post = {
		id: +data.id,
		type: +data.posttypeid === 1 ? 'q' : 'a',
		body: body,
	};

	translations = _( translations ).toPairs().orderBy( t => t[1], 'desc' ).value();
	if ( translations.length )
	{
		post.translation = translations[0][0];
	}

	if ( post.type === 'q' )
	{
		post.title = data.title;
		post.tags = data.tags;
	}
	if ( post.type === 'a' )
	{
		post.parent = +data.parentid;
	}
	return post;
}

// Extract translations from URLs
function extract_translations( translations, match, url )
{
	url = url_parse( url, true );
	var result = '';

	// Check for known Bible sites
	if ( /biblegateway.com$/i.test( url.hostname ) )
	{
		result = url.query.version;
	}
	if ( /biblehub.com$/i.test( url.hostname ) )
	{
		if ( /^\/\w+\/\w+\/\d+\.htm/i.test( url.pathname ) )
		{
			result = url.pathname.split( '/' )[1];
		}
	}
	if ( /bibleserver.com$/i.test( url.hostname ) )
	{
		result = url.pathname.split( '/' )[2];
	}
	if ( /biblestudytools.com$/i.test( url.hostname ) )
	{
		// Note uses some non-standard abbreviations
		if ( /^\/\w+\/\w+\/(\d|passage)/i.test( url.pathname ) )
		{
			result = url.pathname.split( '/' )[1];
		}
	}
	if ( /biblia.com$/i.test( url.hostname ) )
	{
		result = url.pathname.split( '/' )[2];
	}
	if ( /(blbclassic.org|blueletterbible.org)$/i.test( url.hostname ) )
	{
		// Support their new and old format URLs
		if ( /^\/\w+\/\w+\/\d+\/\d+/.test( url.pathname ) )
		{
			result = url.pathname.split( '/' )[1];
		}
		else if ( url.query && url.query.t )
		{
			result = url.query.t;
		}
	}
	if ( /chabad.org$/i.test( url.hostname ) )
	{
		result = 'JUDAICA';
	}
	if ( /(esvbible.org|esv.to)$/i.test( url.hostname ) )
	{
		result = 'ESV';
	}
	if ( /jw.org$/i.test( url.hostname ) )
	{
		result = 'NWT';
	}
	if ( /kingjamesbibleonline.org$/i.test( url.hostname ) )
	{
		result = 'KJV';
	}
	if ( /lds.org$/i.test( url.hostname ) )
	{
		result = 'KJV';
	}
	if ( /mechon-mamre.org$/i.test( url.hostname ) )
	{
		result = 'JPS';
	}
	if ( /newadvent.org$/i.test( url.hostname ) )
	{
		result = 'KNOX';
	}
	if ( /net.bible.org$/i.test( url.hostname ) )
	{
		result = 'NET';
	}
	if ( /ref.ly$/i.test( url.hostname ) )
	{
		result = url.pathname.split( ';' )[1];
	}
	if ( /taggedtanakh.org$/i.test( url.hostname ) )
	{
		result = 'NJPS';
	}
	if ( /usccb.org$/i.test( url.hostname ) )
	{
		result = 'NABRE';
	}
	if ( result )
	{
		result = result.toString().toLowerCase();
		if ( translations[result] )
		{
			translations[result]++;
		}
		else
		{
			translations[result] = 1;
		}
	}
	return '';
}
