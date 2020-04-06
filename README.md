Exercises from Elasticsearch course on Skillshare: https://www.skillshare.com/classes/Elasticsearch-7-and-the-Elastic-Stack-Hands-On/1821362187/projects

# Install Elasticsearch
* `docker pull elasticsearch:7.6.2`
* Setup up docker network so that Kibana can talk to Elasticsearch: https://stackoverflow.com/a/49088814/188740
  * `docker network create elasticsearch-kibana`
  * List networks: `docker network ls`
* `docker run --name skillshare --network elasticsearch-kibana -d -p 9200:9200 -e "discovery.type=single-node" elasticsearch:7.6.2`
* Log in: `docker exec -it skillshare bash`

# Install Kibana
* `docker pull kibana:7.6.2`
* docker network with name `elasticsearch-kibana` needs to have been set up above
  * `docker run -d --name skillshare_kibana --network elasticsearch-kibana -p 5601:5601 --env "ELASTICSEARCH_HOSTS=http://skillshare:9200" kibana:7.6.2`
* Wait a few minutes, then go to: http://localhost:5601 and http://localhost:5601/status
* If there are problems: `docker logs skillshare_kibana`

# Install curl (Windows)
* `scoop install curl`
* Remove PowerShell's default curl alias:
  * Check if PowerShell profile exists: `test-path $profile`
  * Create profile if one doesn't exist: `new-item $profile`
  * Check the profile path: `$profile`
  * Edit the profile: `code $profile`
  * Add the following like: `remove-item alias:curl`
  * Apply the new profile: `. $profile`

# Test installation
* `curl -XGET 127.0.0.1:9200`

# Movie data

## Load data
* `cd data-importer`
* `npm install`
* `npm start`

## Delete index
* Only here for reference. Data will need to be re-loaded if `movies` index is deleted
* `curl -XDELETE 127.0.0.1:9200/movies`

## Examples
_All of these are saved in OneDrive\Fiddler\2020-04-04 elasticsearch samples from skillshare course.saz

`term` vs `match`

> Avoid using the term query for text fields.
> By default, Elasticsearch changes the values of text fields as part of analysis. This can make finding exact matches for text field values difficult.
> To search text field values, use the match query instead.
> Source: https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html

There are so many ways to compose queries. Try this default format as a starting point:
```
GET http://127.0.0.1:9200/movies_ngrams/_search?pretty HTTP/1.1
Host: 127.0.0.1:9200
Content-Type: application/json
Content-Length: 214

{
  "query": {
    "bool": {
      "must": {
        "match": { "title": "star" }
      },
      "should": [
        { "match": { "title": "wars" } }
      ],
      "minimum_should_match": 0
    }
  }
}
```

The same as above but if you want to know which `should` query matched, you can add named queries. Note, in this can you can't use `term` b/c/ `term` only accepts one property:
```
GET http://127.0.0.1:9200/movies_ngrams/_search?pretty HTTP/1.1
Host: 127.0.0.1:9200
Content-Type: application/json
Content-Length: 214

{
  "query": {
    "bool": {
      "must": {
        "match": { "title": "star" }
      },
      "should": [
        {
          "match": {
            "match": { "query": "wars", "_name": "should match wars" }
          }
        }
      ],
      "minimum_should_match": 0
    }
  }
}
```
Other examples

```
GET http://127.0.0.1:9200/movies/_search?pretty HTTP/1.1
Host: 127.0.0.1:9200
Content-Type: application/json
Content-Length: 0
```

```
GET http://127.0.0.1:9200/movies/_doc/109487?pretty HTTP/1.1
Host: 127.0.0.1:9200
Content-Type: application/json
Content-Length: 0
```

```
GET http://127.0.0.1:9200/movies/_search?pretty HTTP/1.1
Host: 127.0.0.1:9200
Content-Type: application/json
Content-Length: 68

{
 "query":{
    "match" : {
      "title": "star"
    }
  }
}
```

```
GET http://127.0.0.1:9200/movies/_search?pretty HTTP/1.1
Host: 127.0.0.1:9200
Content-Type: application/json
Content-Length: 205

{
  "query": {
    "bool": {
      "must": {
        "match": { "title": "star" }
      },
      "filter": {
        "range": {
          "year": { "gte": 2016 }
        }
      }
    }
  }
}
```

```
GET http://127.0.0.1:9200/movies/_search?pretty HTTP/1.1
Host: 127.0.0.1:9200
Content-Type: application/json
Content-Length: 68

{
  "query": {
    "match_phrase": {
      "title": "star wars"
    }
  }
}

```

```
GET http://127.0.0.1:9200/movies/_search?pretty HTTP/1.1
Host: 127.0.0.1:9200
Content-Type: application/json
Content-Length: 134

{
  "query": {
    "match_phrase": {
      "title": {
        "query": "star beyond",
        "slop": 1
      }
    }
  }
}

```

```
GET http://127.0.0.1:9200/movies/_search?pretty HTTP/1.1
Host: 127.0.0.1:9200
Content-Type: application/json
Content-Length: 205

{
  "query": {
    "bool": {
      "must": {
        "match_phrase": { "title": "star wars" }
      },
      "filter": {
        "range": {
          "year": { "gte": 1980 }
        }
      }
    }
  }
}
```

```
GET http://127.0.0.1:9200/movies/_search?pretty HTTP/1.1
Host: 127.0.0.1:9200
Content-Type: application/json
Content-Length: 89

{
  "query": {
    "match": { "genre": "Sci-Fi" }
  },
  "from": 2,
  "size": 2,
  "sort": "year"
}
```

```
GET http://127.0.0.1:9200/movies/_search?pretty HTTP/1.1
Host: 127.0.0.1:9200
Content-Type: application/json
Content-Length: 108

{
  "query": {
    "bool": {
      "must": { "match": { "genre": "Sci-Fi" } },
      "must_not": { "match": { "title": "trek" } },
      "filter": { "range": { "year": { "gte": 2010, "lt": 2015 } } }
    }
  }
}
```

```
GET http://127.0.0.1:9200/movies/_search?pretty HTTP/1.1
Host: 127.0.0.1:9200
Content-Type: application/json
Content-Length: 181

{
  "query": {
    "bool": {
      "must": { "match": { "genre": "Sci-Fi" } },
      "filter": { "range": { "year": { "lt": 1960 } } }
    }
  },
  "sort": "title.raw"
}
```

## Fuzzy

```
GET http://127.0.0.1:9200/movies/_search?pretty HTTP/1.1
User-Agent: Fiddler
Host: 127.0.0.1:9200
Content-Type: application/json
Content-Length: 108

{
  "query": {
    "fuzzy": {
      "title": { "value": "intersteller", "fuzziness": 1 }
    }
  }
}
```

```
GET http://127.0.0.1:9200/movies/_search?pretty HTTP/1.1
Host: 127.0.0.1:9200
Content-Type: application/json
Content-Length: 112

{
  "query": {
    "fuzzy": {
      "title": { "value": "intersteler", "fuzziness": "auto" }
    }
  }
}
```

## Partial match

```
GET http://127.0.0.1:9200/movies/_search?pretty HTTP/1.1
Host: 127.0.0.1:9200
Content-Type: application/json
Content-Length: 112

{
  "query": {
    "wildcard": {
      "title": "pla*"
    }
  }
}
```

## Query-time search as you type

```
GET http://127.0.0.1:9200/movies/_search?pretty HTTP/1.1
Host: 127.0.0.1:9200
Content-Type: application/json
Content-Length: 112

{
  "query": {
    "match_phrase_prefix": {
      "title": {
        "query": "star be",
        "slop": 10
      }
    }
  }
}
```

# Minimal movie data for n-grams autocomplete

## Index-time search as you type (Edge n-grams)

## Load custom analyzer with n-gram
* `curl -H "Content-Type:application/json" -XPUT 127.0.0.1:9200/movies_ngrams --data-binary @movies-ngram-analyzer.json`
* confirm: `curl -XGET 127.0.0.1:9200/movies_ngrams/_settings?pretty`

## Test analyzer
`\"` was required in JSON in PowerShell
```
curl -H "Content-Type:application/json" -XGET 127.0.0.1:9200/movies_ngrams/_analyze?pretty -d '{
  \"analyzer\": \"autocomplete\",
  \"text\": \"Sta\"
}'
```

## Load datatype mapping
Note: `_mappings` suffix in URL, b/c/ movies_ngrams index was already created above.
Inside `movies-mapping-n-grams.json`, `mappings` root property was removed.
* `curl -H "Content-Type:application/json" -XPUT 127.0.0.1:9200/movies_ngrams/_mappings --data-binary @movies-ngrams-mapping.json`
* confirm: `curl -XGET 127.0.0.1:9200/movies_ngrams/_mapping?pretty`

## Load data
* `curl -H "Content-Type: application/json" -XPOST 127.0.0.1:9200/movies_ngrams/_bulk?pretty --data-binary '@movies-ngrams.json'`

## Examples:

```
GET http://127.0.0.1:9200/movies_ngrams/_search?pretty HTTP/1.1
Content-Type: application/json
Content-Length: 132

{
  "query": {
    "match": {
      "title": {
        "query": "sta",
        "analyzer": "standard"
      }
    }
  }
}

```

Query below still returns `Star Trek`. It's not the desired behaviour but a by-product of n-grams. You may want to use [Completion Suggester](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html#completion-suggester) or [Search-as-you-type](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-as-you-type.html) instead.
```
GET http://127.0.0.1:9200/movies_ngrams/_search?pretty HTTP/1.1
Host: 127.0.0.1:9200
Content-Type: application/json
Content-Length: 135

{
  "query": {
    "match": {
      "title": {
        "query": "sta wa",
        "analyzer": "standard"
      }
    }
  }
}

```