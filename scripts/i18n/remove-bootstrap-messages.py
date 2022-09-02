#!/usr/bin/env python

#
# Based on https://github.com/angular/angular-cli/issues/18885#issuecomment-906275106
#

import sys
from lxml import etree

messages_file = './apps/maptio/src/locale/messages.xlf'

def filter_trans_units(xliff):
    """
    Filter trans units

    Modifies the input xliff etree in place
    """
    root = xliff.getroot()
    namespace = xliff.getroot().nsmap[None]
    to_delete = []
    for trans_unit in xliff.iter('{' + namespace + '}trans-unit'):
        # note: must not modify etree during iteration
        if not is_good_trans_unit(trans_unit, namespace):
            to_delete.append(trans_unit)
    for trans_unit in to_delete:
        parent = trans_unit.getparent()
        parent.remove(trans_unit)


def is_good_trans_unit(trans_unit, namespace):
    """
    Test whether to keep a given trans_unit subtree of the xliff file
    """
    return not all(
        is_context_irrelevant(context)
        for context in trans_unit.iter('{' + namespace + '}context')
    )


def is_context_irrelevant(context):
    """
    Return whether to ignore a trans-unit with this context
    """
    if context.attrib.get('context-type') != 'sourcefile':
        return True
    return context.text.startswith('node_modules/@ng-bootstrap')


if __name__ == '__main__':
    parser = etree.XMLParser(remove_blank_text = True)
    with open(messages_file) as f:
        xml = etree.parse(f, parser)

    filter_trans_units(xml)
    pretty_xml = etree.tostring(xml, pretty_print=True, xml_declaration=True, encoding='UTF-8')

    with open(messages_file, 'wb') as f:
        f.write(pretty_xml)
