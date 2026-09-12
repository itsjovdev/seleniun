import sys
from pdf2docx import Converter

input_pdf = sys.argv[1]
output_docx = sys.argv[2]

cv = Converter(input_pdf)
cv.convert(output_docx)
cv.close()