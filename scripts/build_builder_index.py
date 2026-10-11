"""Shared, metadata-only builder read model and offline search baseline."""
import argparse
import json
import re
import unicodedata
from pathlib import Path

import crawl
import build_site

ROOT = Path(__file__).resolve().parents[1]
FACETS = ('audiences', 'subjects', 'platforms', 'scenarios', 'capabilities')


def normalize(text):
    return unicodedata.normalize('NFKC', text).casefold().strip()


def keyword_match(text, keyword):
    word = normalize(keyword)
    if word.isascii() and word.replace(' ', '').replace('-', '').isalnum():
        return bool(re.search(r'(?<!\w)' + re.escape(word) + r'(?!\w)', text))
    return word in text


def build(root=ROOT):
    config = crawl.read_json(root/'config/builder-discovery.json')
    # Keep query hints separate from the existing repository snapshot contract.
    # New verified builder observations use the same public field allowlist.
    canonical_repos = list(crawl.Registry(root/'data/registry.jsonl').records.values())
    repository_hints = {r['github_repo_id']: r.get('builder_discovery_hints', {})
        for r in canonical_repos if r.get('github_repo_id')}
    curated = {r['resource_key']: r for r in crawl.read_json(root/'data/education-resources.json')['resources']}
    records = []
    for name in ('registry', 'skills'):
        rows = crawl.read_json(root/f'web/data/{name}.json')['records']
        if name == 'registry':
            public_ids = {r['github_repo_id'] for r in rows}
            rows = rows + [build_site.public_record(r) for r in canonical_repos
                if r.get('builder_discovery_hints') and r.get('verification_status') == 'verified'
                and r['github_repo_id'] not in public_ids]
        for row in rows:
            skill = name == 'skills'
            if not skill and not isinstance(row.get('github_repo_id'), int):
                # Named unresolved leads have no stable repository ID yet.
                continue
            key = row['skill_key'] if skill else f'repo:{row["github_repo_id"]}'
            selected = curated.get(key, {})
            hints = row.get('builder_discovery_hints', {}) if skill else repository_hints.get(row['github_repo_id'], {})
            record = {'resource_id': key, 'kind': 'skill' if skill else row['entity_kind'],
                'title': (row.get('skill_name') or row.get('skill_path') or key) if skill else (row.get('full_name') or row.get('name') or key),
                'description': selected.get('purpose_zh') or row.get('description') or '',
                'source_url': row['manifest_url'] if skill else row['html_url'],
                'repository_url': row['source_repository']['html_url'] if skill else row['html_url'],
                'verified_at': row.get('fetched_at'), 'pinned_commit': row.get('pinned_commit') or selected.get('pinned_commit'),
                'license_observed': row['source_repository'].get('license_spdx') if skill else row.get('license_spdx'),
                'license_scopes': selected.get('license_scopes', []),
                'reuse_status': selected.get('reuse_status', 'needs-review'),
                'runtime_tested': False, 'curated': bool(selected),
                'facet_hints': {k: list(hints.get(k, [])) for k in FACETS},
                'facet_evidence': 'metadata-keyword-or-discovery-query',
                'topics': row.get('topics', []) + selected.get('course_tags', [])}
            text = normalize(record['title'] + ' ' + record['description'] + ' ' + ' '.join(record['topics']))
            for family in config['families']:
                if any(keyword_match(text, word) for word in family['keywords']):
                    for facet in FACETS:
                        record['facet_hints'][facet] = sorted(set(record['facet_hints'][facet] + family.get(facet, [])))
            records.append(record)
    if len({r['resource_id'] for r in records}) != len(records):
        raise ValueError('duplicate builder resource identity')
    payload = {'schema_version': 'radar.builder-index.v1', 'generated_at': crawl.utc_now(),
               'count': len(records), 'records': records,
               'note': 'Facets are discovery hints. Source verification, scoped license observation and runtime evaluation are independent; this index does not grant reuse rights.'}
    for folder in ('data', 'site/data', 'web/data'):
        crawl.write_json(root/f'{folder}/builder-index.json', payload)
    return payload


def search(payload, config, query='', *, filters=None, limit=10):
    families = config['families']
    groups = []
    for term in normalize(query).split():
        synonyms = {term}
        for family in families:
            if term == family['id'] or term in map(normalize, family['keywords']):
                synonyms.update(map(normalize, family['keywords']))
        groups.append(synonyms)
    matches = []
    for record in payload['records']:
        if any(value not in record['facet_hints'].get(key, []) for key, value in (filters or {}).items() if value):
            continue
        text = normalize(record['title'] + ' ' + record['description'] + ' ' + ' '.join(record.get('topics', [])))
        if not all(any(keyword_match(text, word) for word in group) for group in groups):
            continue
        score = sum(3 if keyword_match(normalize(record['title']), term) else 1 for term in normalize(query).split())
        matches.append((score + int(record['curated']), record))
    matches.sort(key=lambda x: (-x[0], x[1]['title']))
    return {'query': query, 'matched_count': len(matches), 'records': [r for _, r in matches[:limit]],
            'method': 'keyword-and-curation-baseline', 'model_calls': 0,
            'note': payload['note']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('query', nargs='?', default='')
    parser.add_argument('--build', action='store_true')
    for facet, flag in zip(FACETS, ('audience', 'subject', 'platform', 'scenario', 'capability')):
        parser.add_argument('--' + flag, dest=facet)
    parser.add_argument('--limit', type=int, default=10)
    args = parser.parse_args()
    if not 1 <= args.limit <= 50:
        parser.error('--limit must be between 1 and 50')
    if args.build:
        print(json.dumps({'count': build()['count']}))
    else:
        payload = crawl.read_json(ROOT/'data/builder-index.json')
        config = crawl.read_json(ROOT/'config/builder-discovery.json')
        print(json.dumps(search(payload, config, args.query,
            filters={f: getattr(args, f) for f in FACETS}, limit=args.limit), ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
