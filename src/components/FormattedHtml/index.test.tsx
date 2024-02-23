import React from 'react';
import { render } from '@testing-library/react-native';
import FormattedHTML from './';

describe('FormattedHTML', () => {
  it('renders the contents of <sub> tags correctly', () => {
    const HTML_STRING = `<h1>Heading<sub>1</sub> containing <sub>some <em>emphasised</em> subscript</sub> text</h1>
    <p>Paragraph<sub>1</sub> containing <sub>some <em>emphasised</em> subscript</sub> text</p>`;
    const { toJSON } = render(<FormattedHTML contentWidth={10} html={HTML_STRING} />);

    expect(toJSON()).toMatchSnapshot();
  });

  it('renders the contents of <sup> tags correctly', () => {
    const HTML_STRING = `<h1>1<sup>st</sup> heading containing <sup>some <em>emphasised</em> superscript</sup> text</h1>
    <p>1<sup>st</sup> paragraph containing <sup>some <em>emphasised</em> superscript</sup> text</p>`;
    const { toJSON } = render(<FormattedHTML contentWidth={10} html={HTML_STRING} />);

    expect(toJSON()).toMatchSnapshot();
  });

  it('renders the contents of <latex-formula> tags correctly', () => {
    const HTML_STRING = `<p>In physics, the mass-energy equivalence is stated by the equation
    <latex-formula display="inline">E=mc^2</latex-formula>some more text</p>
    <latex-formula>\\nabla \\cdot \\mathbf{E} = \\rho/\\epsilon_0</latex-formula>
    <p>another paragraph</p><p>some text <latex-formula display="inline">\\frac{2}{5}
    </latex-formula> is the same as <latex-formula display="inline">\\frac{4}{10}</latex-formula>
    which is 0.4. Hence some more mathematical information <latex-formula display="inline">\\frac{2}{5}
    </latex-formula>, 0.4 <sup>and 40%</sup> are <latex-formula>a\\blacksquare \\blacklozenge</latex-formula>all equivalent.</p>`;

    const { toJSON } = render(<FormattedHTML contentWidth={10} html={HTML_STRING} />);

    expect(toJSON()).toMatchSnapshot();
  });

  it('renders the contents of <blockquote> tags correctly', async () => {
    const HTML_STRING = `<h1>Heading text</h1>
    <p>Paragraph containing an important blockquote that people should take notice of <blockquote><h1>there could be a heading?</h1><p>interesting text that is pulled out into a blockquote so it appears differently</p> <p>I think it's probably going to be plain<sub>mostly?</sub> text</p></blockquote> text that goes underneath the blockquote which looks less interesting </p><p>Then we have a blockquote that is more than one line <blockquote><p>This blockquote is made of up of two statements. This is the first. </p> <p>And this is the second.</p><p>and an extra third paragraph for the sake of it</p></blockquote> hope you enjoyed that blockquote. Here's an empty one <blockquote></blockquote> Bye for now! </p>`;

    const { toJSON } = render(<FormattedHTML contentWidth={10} html={HTML_STRING} />);

    expect(toJSON()).toMatchSnapshot();
  });

  it('renders the contents of <code> tags correctly', () => {
    const code = `<pre><code syntax-language="kotlin">
    fun transform(pet: Animal): Int {
      return when (pet) {
        "alpaca" -> 0
        "panda" -> 1
        "dog" -> 2
        else -> throw IllegalArgumentException("Invalid pet param value")
      }
    }
    </code></pre>`;

    const { toJSON } = render(<FormattedHTML contentWidth={10} html={code} />);

    expect(toJSON()).toMatchSnapshot();
  });
});
