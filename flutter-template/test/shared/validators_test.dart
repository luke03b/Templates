// Unit test dei validatori condivisi dei form.
import 'package:flutter_template/shared/validators/validators.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('required rejects empty and blank values', () {
    final v = Validators.required();
    expect(v(null), isNotNull);
    expect(v('   '), isNotNull);
    expect(v('ok'), isNull);
  });

  test('maxLength counts trimmed characters', () {
    final v = Validators.maxLength(3);
    expect(v(' abc '), isNull);
    expect(v('abcd'), isNotNull);
  });

  test('number and min accept comma decimals', () {
    expect(Validators.number()('12,5'), isNull);
    expect(Validators.number()('abc'), isNotNull);
    expect(Validators.min(0)('-1'), isNotNull);
    expect(Validators.min(0)('0'), isNull);
    expect(Validators.parseNumber('12,5'), 12.5);
  });

  test('email validates a basic format', () {
    expect(Validators.email()('a@b.it'), isNull);
    expect(Validators.email()('not-an-email'), isNotNull);
  });

  test('compose returns the first error', () {
    final v = Validators.compose([
      Validators.required('missing'),
      Validators.maxLength(2),
    ]);
    expect(v(''), 'missing');
    expect(v('abc'), contains('at most 2'));
    expect(v('ab'), isNull);
  });
}
